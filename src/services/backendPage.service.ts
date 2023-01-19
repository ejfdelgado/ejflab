import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MyConstants } from '../../srcJs/MyConstants';

@Injectable({
  providedIn: 'root',
})
export class BackendPageService {
  constructor(private http: HttpClient) {}

  async getCurrentPage() {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`${MyConstants.SRV_ROOT}srv/pg`).subscribe((data) => {
        resolve(data);
      });
    });
  }
}
