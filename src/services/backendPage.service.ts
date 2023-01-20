import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConstants } from '../../srcJs/MyConstants';
import { IndicatorService } from './indicator.service';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  constructor(
    private http: HttpClient,
    private indicatorSrv: IndicatorService,
    ) {}

  async getCurrentPage() {
    const wait = this.indicatorSrv.start();
    try {
      const respuesta = await new Promise((resolve, reject) => {
        this.http.get<any>(`${MyConstants.SRV_ROOT}srv/pg`).subscribe((data) => {
          resolve(data);
        });
      });
    } catch (error) {
      throw error;
    } finally {
      wait.done();
    }
  }
}
