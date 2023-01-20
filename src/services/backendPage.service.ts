import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConstants } from '../../srcJs/MyConstants';
import { IndicatorService } from './indicator.service';
import { PageData } from 'src/interfaces/login-data.interface';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  constructor(
    private http: HttpClient,
    private indicatorSrv: IndicatorService
  ) {}

  async getCurrentPage(): Promise<PageData> {
    const wait = this.indicatorSrv.start();
    try {
      const respuesta = await new Promise<PageData>((resolve, reject) => {
        this.http
          .get<PageData>(`${MyConstants.SRV_ROOT}srv/pg`)
          .subscribe((data) => {
            resolve(data);
          });
      });
      return respuesta;
    } catch (error) {
      throw error;
    } finally {
      wait.done();
    }
  }
}
