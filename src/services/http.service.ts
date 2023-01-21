import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyConstants } from 'srcJs/MyConstants';
import { IndicatorService } from './indicator.service';
import { ModalService } from './modal.service';
import { AuthService } from 'src/services/auth.service';
import { Buffer } from 'buffer';

const MAPEO_MIME_TIMES: { [key: string]: string } = {
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/tiff': 'tiff',
  'image/png': 'png',
};

const EXTENSION_FALLBACK = 'jpg';

async function b64toBlob(b64Data: string) {
  const base64Response = await fetch(b64Data);
  const blob = await base64Response.blob();
  return blob;
}

function checkMaxFileSize(myBlob: Blob, MAX_MB: number) {
  if (myBlob.size > 1024 * 1024 * MAX_MB) {
    throw new Error(`La imagen es muy grande, se espera menor a ${MAX_MB}MB`);
  }
}

export interface LoadFileData {
  folder?: string | null;
  fileName?: string | null;
  sizeBig?: string | null;
  sizeSmall?: string | null;
  folderType?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private indicatorSrv: IndicatorService,
    private modalSrv: ModalService,
    private auth: AuthService
  ) {}

  async postWithFile(
    myFile: string,
    subUrl: string,
    extra: any = null,
    options?: HttpOptionsData,
    loadOptions?: LoadFileData
  ) {
    const UPLOAD_URL = `${MyConstants.SRV_ROOT}${subUrl}`;
    const accessToken = await this.auth.getIdToken();
    const extraText = Buffer.from(JSON.stringify(extra)).toString('base64');
    let extension: string | null = null;
    const mimeParts = /data:([^;]+)/gi.exec(myFile);
    if (mimeParts != null) {
      extension = MAPEO_MIME_TIMES[mimeParts[1]];
    }
    if (!extension) {
      extension = EXTENSION_FALLBACK;
    }
    const blob = await b64toBlob(myFile);
    checkMaxFileSize(blob, MyConstants.BUCKET.MAX_MB);
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('POST', UPLOAD_URL, true);
      req.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      if (typeof loadOptions?.fileName == 'string') {
        req.setRequestHeader('filename', loadOptions.fileName);
      } else {
        req.setRequestHeader('filename', `miarchivo.${extension}`);
      }
      if (typeof loadOptions?.folder == 'string') {
        req.setRequestHeader('folder', loadOptions.folder);
      }
      if (loadOptions?.sizeBig != null) {
        req.setRequestHeader('size_big', loadOptions.sizeBig);
      }
      if (loadOptions?.sizeSmall != null) {
        req.setRequestHeader('size_small', loadOptions.sizeSmall);
      }
      if (loadOptions?.folderType != null) {
        req.setRequestHeader('folder_type', loadOptions.folderType);
      }
      req.setRequestHeader('extra', extraText);
      req.onload = (event) => {
        const jsonResponse = JSON.parse(req.responseText);
        const status = req.status;
        if ([428, 424].indexOf(status) >= 0) {
          reject(status);
        } else {
          if (status >= 400 && status <= 599) {
            reject(new Error(jsonResponse));
          } else {
            resolve(jsonResponse);
          }
        }
      };
      req.onerror = () => {
        const error = new Error('Error guardando archivo');
        this.modalSrv.error(error);
        reject();
      };
      req.send(blob);
    });
  }

  async get<Type>(
    path: string,
    options?: HttpOptionsData
  ): Promise<Type | null> {
    let wait = null;
    if (!options || options.showIndicator !== false) {
      wait = this.indicatorSrv.start();
    }
    try {
      const respuesta = await new Promise<Type | null>((resolve, reject) => {
        this.http
          .get<Type>(`${MyConstants.SRV_ROOT}${path}`)
          .pipe(
            catchError((error) => {
              if (!options || options.showError !== false) {
                if (error.error) {
                  this.modalSrv.error(error.error);
                } else {
                  this.modalSrv.error(error);
                }
              }
              reject(error);
              return of(null);
            })
          )
          .subscribe((data) => {
            resolve(data);
          });
      });
      return respuesta;
    } catch (err) {
      throw err;
    } finally {
      if (wait != null) {
        wait.done();
      }
    }
  }
  async post<Type>(
    path: string,
    payload: any,
    options?: HttpOptionsData
  ): Promise<Type | null> {
    let wait = null;
    if (!options || options.showIndicator !== false) {
      wait = this.indicatorSrv.start();
    }
    try {
      const respuesta = await new Promise<Type | null>((resolve, reject) => {
        this.http
          .post<Type>(`${MyConstants.SRV_ROOT}${path}`, payload)
          .pipe(
            catchError((error) => {
              if (!options || options.showError !== false) {
                if (error.error) {
                  this.modalSrv.error(error.error);
                } else {
                  this.modalSrv.error(error);
                }
              }
              reject(error);
              return of(null);
            })
          )
          .subscribe((data) => {
            resolve(data);
          });
      });
      return respuesta;
    } catch (err) {
      throw err;
    } finally {
      if (wait != null) {
        wait.done();
      }
    }
  }
}
