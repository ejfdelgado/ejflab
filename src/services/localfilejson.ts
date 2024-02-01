import { Buffer } from 'buffer';
import { HttpService } from './http.service';
import { MyRoutes } from 'srcJs/MyRoutes';
import { FileSaveData, FileSaveResponseData } from './fileInterface';

export class LocalFileJson {
  FILE_NAME: string;
  constructor(public httpSrv: HttpService) {}
  getRelativePath() {
    // Later here can access pageid to be relative to the current page Id
    const partes = MyRoutes.splitPageData(location.pathname);
    const pageType = partes.pageType;
    const pageId = '0';
    return `srv${pageType}/${pageId}`;
  }
  async delete(): Promise<void> {
    const path = this.getRelativePath();
    await this.httpSrv.delete(`${path}/${this.FILE_NAME}`, {
      avoidToken: true,
    });
  }
  async read(): Promise<any> {
    const respuesta = await this.httpSrv.get(
      `${this.getRelativePath()}/${this.FILE_NAME}`,
      {
        avoidToken: true,
        rawString: true,
        showError: false,
      }
    );
    if (respuesta == null) {
      // No existe y se crea predeterminado {}
      const defaultContent = {};
      await this.save(defaultContent);
      return defaultContent;
    } else {
      return JSON.parse(respuesta as string);
    }
  }
  async save(data: any): Promise<FileSaveResponseData> {
    const path = this.getRelativePath();
    const payload: FileSaveData = {
      fileName: `${path}/${this.FILE_NAME}`,
      base64: Buffer.from(JSON.stringify(data), 'utf8').toString('base64'),
    };
    const response = await this.httpSrv.post(payload.fileName, payload, {
      avoidToken: true,
    });
    return response as FileSaveResponseData;
  }
}
