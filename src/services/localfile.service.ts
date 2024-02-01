import { EventEmitter, Injectable } from '@angular/core';
import { MyConstants } from 'srcJs/MyConstants';
import {
  FileRequestData,
  FileSaveData,
  FileSaveResponseData,
  FileServiceI,
} from './fileInterface';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class LocalFileService implements FileServiceI {
  constructor(private httpSrv: HttpService) {}
  getRelativePath() {
    // Later here can access pageid to be relative to the current page Id
    return 'srv/pageid/localfile';
  }
  sendRequest(request: FileRequestData, callback: Function): void {
    throw new Error('Method not implemented.');
  }
  async delete(url: string): Promise<void> {
    const path = this.getRelativePath();
    await this.httpSrv.delete(`${path}/${url.replace(/^[/]+/, '')}`, {
      avoidToken: true,
    });
  }
  async readPlainText(url: string): Promise<string> {
    const respuesta = await this.httpSrv.get(
      `${this.getRelativePath()}/${url.replace(/^[/]+/, '')}`,
      {
        avoidToken: true,
        rawString: true,
      }
    );
    return respuesta as string;
  }
  async save(payload: FileSaveData): Promise<FileSaveResponseData> {
    const path = this.getRelativePath();
    payload.fileName = `${path}/${payload.fileName.replace(/^[/]+/, '')}`;
    const response = await this.httpSrv.post(path, payload, {
      avoidToken: true,
    });
    return response as FileSaveResponseData;
  }
}
