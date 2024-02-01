import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { catchError, of, Subscription } from 'rxjs';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyConstants } from 'srcJs/MyConstants';
import { MyRoutes } from 'srcJs/MyRoutes';
import {
  FileRequestData,
  FileSaveData,
  FileSaveResponseData,
  FileServiceI,
} from './fileInterface';
import { HttpService } from './http.service';

export interface frameVideoDetailRequestData {
  duration: number;
  audioUrl: string;
  imageUrl: string;
  key: string;
}

export interface frameVideoRequestData {
  frames: Array<frameVideoDetailRequestData>;
  width: number;
  height: number;
  key: string;
  download?: boolean;
}

export interface FileResponseData {
  canceled?: boolean;
  base64: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileService implements FileServiceI {
  evento: EventEmitter<FileRequestData>;
  eventResponse: EventEmitter<FileResponseData>;
  callback: Function | null = null;
  constructor(private httpSrv: HttpService, private httpClient: HttpClient) {
    this.evento = new EventEmitter<FileRequestData>();
    this.eventResponse = new EventEmitter<FileResponseData>();

    this.eventResponse.subscribe((response: FileResponseData) => {
      if (this.callback) {
        this.callback(response);
      }
    });
  }

  subscribe(escucha: Function): Subscription {
    return this.evento.subscribe(escucha);
  }

  sendResponse(response: FileResponseData) {
    this.eventResponse.emit(response);
  }

  getLastCallback(): Function | null {
    return this.callback;
  }

  sendRequest(request: FileRequestData, callback: Function): void {
    // Connect to other callback
    this.callback = callback;
    this.evento.emit(request);
  }

  async readPlainText(url: string): Promise<string> {
    const theUrl = MyConstants.getCompleteUrl(url);
    const respuesta = await new Promise<string>((resolve, reject) => {
      this.httpClient
        .get(theUrl, { responseType: 'text' })
        .pipe(
          catchError((error) => {
            return of('');
          })
        )
        .subscribe((data) => {
          resolve(data);
        });
    });
    return respuesta;
  }

  async delete(url: string): Promise<void> {
    const partes = MyRoutes.splitPageData(location.pathname);
    const options: HttpOptionsData = {
      showIndicator: true,
    };
    const isFakeUrl = url.startsWith('blob:');
    if (!isFakeUrl) {
      await this.httpSrv.delete(url, options);
    }
  }

  async makePublic(key: string) {
    const idPage = this.getIdPage();
    const URL = `srv/${idPage}/makefilepub`;
    const options: HttpOptionsData = {
      showIndicator: true,
    };
    const response: any = await this.httpSrv.post(URL, { key }, options);
    return response;
  }

  async generateGif(payload: frameVideoRequestData) {
    const idPage = this.getIdPage();
    const URL = `srv/${idPage}/makegif`;
    const options: HttpOptionsData = {
      showIndicator: true,
    };
    const response: any = await this.httpSrv.post(URL, payload, options);
    return response;
  }

  getIdPage() {
    const idPage = document
      .getElementById('meta_page_id')
      ?.getAttribute('content');
    if (!idPage) {
      throw Error('No se encontró el id de la página actual.');
    }
    return idPage;
  }

  async save(payload: FileSaveData): Promise<FileSaveResponseData> {
    const idPage = this.getIdPage();
    const partes = MyRoutes.splitPageData(location.pathname);
    const pageType = partes.pageType;
    const URL = `srv/${idPage}/file`;
    const options: HttpOptionsData = {
      showIndicator: true,
    };
    const response: FileSaveResponseData = await this.httpSrv.postWithFile(
      payload.base64,
      URL,
      {},
      options,
      {
        folder: `srv/pg${pageType}/`,
        fileName: `/${idPage}/${payload.fileName}`,
        foldertype: 'OWN',
        isplainfile: '1',
        isprivate: payload.isPublic === true ? '0' : '1',
        erasefile: payload.erasefile,
      }
    );
    return response;
  }

  async listLocalFiles(path: string) {
    const URL = `srv/local/ls`;
    const options: HttpOptionsData = {
      showIndicator: true,
      avoidToken: true,
    };
    const response: any = await this.httpSrv.post(URL, { path }, options);
    return response;
  }
}
