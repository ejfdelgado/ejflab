import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { HttpOptionsData } from 'src/interfaces/login-data.interface';
import { MyConstants } from 'srcJs/MyConstants';
import { IndicatorService } from './indicator.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private indicatorSrv: IndicatorService,
    private modalSrv: ModalService
  ) {}
  async get<Type>(
    path: string,
    options?: HttpOptionsData
  ): Promise<Type | null> {
    let wait = null;
    if (!options || options.showIndicator !== false) {
      wait = this.indicatorSrv.start();
    }
    try {
      const respuesta = await new Promise<Type | null>((resolve, reject) => {
        this.http
          .get<Type>(`${MyConstants.SRV_ROOT}${path}`)
          .pipe(
            catchError((error) => {
              if (!options || options.showError !== false) {
                if (error.error) {
                  this.modalSrv.error(error.error);
                } else {
                  this.modalSrv.error(error);
                }
              }
              reject(error);
              return of(null);
            })
          )
          .subscribe((data) => {
            resolve(data);
          });
      });
      return respuesta;
    } catch (err) {
      return null;
    } finally {
      if (wait != null) {
        wait.done();
      }
    }
  }
  async post<Type>(
    path: string,
    payload: any,
    options?: HttpOptionsData
  ): Promise<Type | null> {
    let wait = null;
    if (!options || options.showIndicator !== false) {
      wait = this.indicatorSrv.start();
    }
    try {
      const respuesta = await new Promise<Type | null>((resolve, reject) => {
        this.http
          .post<Type>(`${MyConstants.SRV_ROOT}${path}`, payload)
          .pipe(
            catchError((error) => {
              if (!options || options.showError !== false) {
                if (error.error) {
                  this.modalSrv.error(error.error);
                } else {
                  this.modalSrv.error(error);
                }
              }
              reject(error);
              return of(null);
            })
          )
          .subscribe((data) => {
            resolve(data);
          });
      });
      return respuesta;
    } catch (err) {
      return null;
    } finally {
      if (wait != null) {
        wait.done();
      }
    }
  }
}
