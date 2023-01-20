import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConstants } from '../../srcJs/MyConstants';
import { IndicatorService } from './indicator.service';
import { PageData } from 'src/interfaces/login-data.interface';
import { catchError, of } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  evento: EventEmitter<PageData | null>;
  constructor(
    private httpSrv: HttpService,
    private http: HttpClient,
    private indicatorSrv: IndicatorService
  ) {
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
    const actual = await this.httpSrv.post<PageData>('srv/pg', {
      id,
      datos,
    });
    this.evento.emit(actual);
    return actual;
  }
}
