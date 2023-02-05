import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IndicatorService } from './indicator.service';
import { PageData } from 'src/interfaces/login-data.interface';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  evento: EventEmitter<PageData | null>;
  constructor(private httpSrv: HttpService) {
    this.evento = new EventEmitter();
  }

  async getCurrentPage(): Promise<PageData | null> {
    if (location.pathname == '/') {
      //The home has no Page representation in DB
      this.evento.emit(null);
      return null;
    } else {
      const actual = await this.httpSrv.get<PageData>('srv/pg');
      this.evento.emit(actual);
      return actual;
    }
  }

  async savePage(id: string, datos: PageData): Promise<PageData | null> {
    let actual: PageData | null = null;
    const payload = {
      id,
      datos,
    };
    const URL = 'srv/pg';
    if (datos.image) {
      const image = datos.image;
      delete datos.image;
      await this.httpSrv.postWithFile(
        image,
        URL,
        payload,
        {},
        {
          folder: 'page',
          fileName: `/${id}/front.jpg`,
          folderType: 'own',
          sizeBig: '512',
          sizeSmall: '256',
        }
      );
    } else {
      actual = await this.httpSrv.post<PageData>(URL, payload);
      this.evento.emit(actual);
    }
    return actual;
  }
}
