import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IndicatorService } from './indicator.service';
import { PageData } from 'src/interfaces/login-data.interface';
import { HttpService } from './http.service';
import { MyDates } from 'srcJs/MyDates';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  evento: EventEmitter<PageData | null>;
  pageKeys: any = null;
  pageKeysEvent: EventEmitter<any>;
  pageKeysTimeoutId: any = null;
  constructor(private httpSrv: HttpService) {
    this.evento = new EventEmitter();
    this.pageKeysEvent = new EventEmitter();
    this.evento.subscribe((myPage) => {
      if (myPage) {
        const pageId = myPage.id;
        if (pageId && this.pageKeysTimeoutId == null) {
          this.startReadingPageKeys(pageId);
        }
      }
    });
  }

  async getPageKeys() {
    const prioritize = (objeto: any) => {
      const epoch = this.httpSrv.getServerTime();
      const { actual, siguiente } = MyDates.getDates(epoch);
      const respuesta = [];
      if (actual in objeto) {
        respuesta.push(objeto[actual]);
      }
      if (siguiente in objeto) {
        respuesta.push(objeto[siguiente]);
      }
      return respuesta;
    };
    return new Promise((resolve) => {
      if (this.pageKeys == null) {
        const subscription = this.pageKeysEvent.subscribe((pageKeys) => {
          resolve(prioritize(pageKeys));
          subscription.unsubscribe();
        });
      } else {
        resolve(prioritize(this.pageKeys));
      }
    });
  }

  async startReadingPageKeys(pageId: string) {
    const epoch = this.httpSrv.getServerTime();
    const { actual, siguiente, anterior, deadline } = MyDates.getDates(epoch);
    if (this.pageKeys == null || !(siguiente in this.pageKeys)) {
      this.pageKeys = await this.httpSrv.get<any>(`srv/${pageId}/keys`, {
        showIndicator: false,
        showError: false,
      });
      this.pageKeysEvent.emit(this.pageKeys);
      // Dice cuando se debe volver a invocar
      if (this.pageKeysTimeoutId != null) {
        clearTimeout(this.pageKeysTimeoutId);
      }
      const startReadingPageKeysThis = this.startReadingPageKeys.bind(this);
      this.pageKeysTimeoutId = setTimeout(startReadingPageKeysThis, deadline);
    }
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
      datos,
    };
    const URL = `srv/${id}/pg`;
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
          foldertype: 'own',
          sizebig: '512',
          sizesmall: '256',
        }
      );
    } else {
      actual = await this.httpSrv.post<PageData>(URL, payload);
      this.evento.emit(actual);
    }
    return actual;
  }
}
