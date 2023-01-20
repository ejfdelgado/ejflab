import { Injectable } from '@angular/core';
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
  constructor(
    private httpSrv: HttpService,
    private http: HttpClient,
    private indicatorSrv: IndicatorService
  ) {}

  async getCurrentPage(): Promise<PageData | null> {
    return this.httpSrv.get<PageData>('srv/pg');
  }

  async savePage(id: string, datos: PageData): Promise<any> {
    return this.httpSrv.post<PageData>('srv/pg', { id, datos });
  }
}
