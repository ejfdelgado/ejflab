import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyRoutes } from 'srcJs/MyRoutes';
import { HttpService } from './http.service';

export interface FileRequestData {
  type: string; // file, fileimage, photo, fileimage-photo, fileaudio
}

export interface FileResponseData {
  canceled?: boolean;
  base64: string;
  fileName: string;
}

export interface FileSaveData {
  base64: string;
  fileName: string;
  erasefile?: string | null;
}

export interface FileSaveResponseData {
  uri: string;
  key: string;
  bucket: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  evento: EventEmitter<FileRequestData>;
  eventResponse: EventEmitter<FileResponseData>;
  callback: Function | null = null;
  constructor(private httpSrv: HttpService) {
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

  async delete(url: string): Promise<void> {
    const partes = MyRoutes.splitPageData(location.pathname);
    const options: HttpOptionsData = {
      showIndicator: true,
    };
    await this.httpSrv.delete(url, {}, options);
  }

  async save(payload: FileSaveData): Promise<FileSaveResponseData> {
    const idPage = document
      .getElementById('meta_page_id')
      ?.getAttribute('content');
    if (!idPage) {
      throw Error('No se encontró el id de la página actual.');
    }
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
        isprivate: '1',
        erasefile: payload.erasefile,
      }
    );
    return response;
  }
}
