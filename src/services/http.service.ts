import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyConstants } from 'srcJs/MyConstants';
import { IndicatorService, Wait } from './indicator.service';
import { ModalService } from './modal.service';
import { AuthService } from 'src/services/auth.service';
import { Buffer } from 'buffer';

const DEFAULT_PAGE_SIZE = 30;

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
  folder?: string | null; // predeterminado es general
  fileName?: string | null; // overwrite the path and file name
  sizeBig?: string | null; // 1024
  sizeSmall?: string | null; //256
  folderType?: string | null; //FIRST_YEAR_MONTH|FIRST_EMAIL|own
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
    let wait: Wait | null = null;
    if (!options || options.showIndicator !== false) {
      wait = this.indicatorSrv.start();
    }
    try {
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
      const promesa = new Promise((resolve, reject) => {
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
          req.setRequestHeader('sizebig', loadOptions.sizeBig);
        }
        if (loadOptions?.sizeSmall != null) {
          req.setRequestHeader('sizesmall', loadOptions.sizeSmall);
        }
        if (loadOptions?.folderType != null) {
          req.setRequestHeader('foldertype', loadOptions.folderType);
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
        req.onerror = (e: ProgressEvent) => {
          console.log(e);
          if (!options || options.showError !== false) {
            const error = new Error('Error guardando archivo');
            this.modalSrv.error(error);
          }
          reject();
        };
        req.send(blob);
      });
      promesa.finally(() => {
        if (wait != null) {
          wait.done();
        }
      });
      return promesa;
    } catch (err) {
      if (wait != null) {
        wait.done();
      }
    }
  }

  async getAll<Type>(
    path: string,
    options?: HttpOptionsData
  ): Promise<Array<Type>> {
    const params = {
      max: options?.pageSize ? options?.pageSize : DEFAULT_PAGE_SIZE,
      offset: 0,
    };
    let total: Array<Type> = [];
    let actual: any | null;
    let prefijo = '?';
    let added: number = 0;
    if (path.indexOf('?') >= 0) {
      prefijo = '&';
    }
    do {
      actual = await this.get<any | null>(
        `${path}${prefijo}offset=${params.offset}&max=${params.max}`,
        options
      );
      if (actual != null) {
        let arreglo = actual;
        if (typeof options?.key == 'string') {
          const partes = options?.key?.split('.');
          for (let i = 0; i < partes.length; i++) {
            const parte = partes[i];
            arreglo = arreglo[parte];
            if ([null, undefined].indexOf(arreglo) >= 0) {
              throw new Error(
                `La ruta ${options?.key} no se encontró en la respuesta.`
              );
            }
          }
        }
        if (arreglo instanceof Array) {
          added = arreglo.length;
          for (let i = 0; i < added; i++) {
            total.push(arreglo[i]);
          }
          params.offset += added;
        }
      }
    } while (actual != null && added > 0);
    return total;
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
