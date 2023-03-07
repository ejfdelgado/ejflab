import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

export interface WebcamRequestData {}

export interface WebcamResponseData {
  canceled?: boolean;
  base64?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebcamService {
  evento: EventEmitter<WebcamRequestData>;
  eventResponse: EventEmitter<WebcamResponseData>;
  constructor() {
    this.evento = new EventEmitter<WebcamRequestData>();
    this.eventResponse = new EventEmitter<WebcamResponseData>();
  }

  subscribe(escucha: Function): Subscription {
    return this.evento.subscribe(escucha);
  }

  sendResponse(response: WebcamResponseData) {
    this.eventResponse.emit(response);
  }

  async openWebcam(request: WebcamRequestData): Promise<WebcamResponseData> {
    return new Promise((resolve, reject) => {
      this.evento.emit(request);
      const subscripcion = this.eventResponse.subscribe(
        (response: WebcamResponseData) => {
          resolve(response);
          subscripcion.unsubscribe();
        }
      );
    });
  }
}
