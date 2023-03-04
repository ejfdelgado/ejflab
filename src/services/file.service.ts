import { Injectable } from '@angular/core';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyRoutes } from 'srcJs/MyRoutes';
import { HttpService } from './http.service';

export interface FileSaveData {
  base64: string;
  fileName: string;
  erasefile?: string;
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
  constructor(private httpSrv: HttpService) {}

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
