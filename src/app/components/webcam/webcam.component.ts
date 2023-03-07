import { Component, OnInit } from '@angular/core';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { WebcamRequestData, WebcamService } from 'src/services/webcam.service';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.css'],
})
export class WebcamComponent implements OnInit {
  isActive: boolean = false;
  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();
  sysImage = '';
  step = 1;
  constructor(private webcamSrv: WebcamService) {}

  ngOnInit(): void {
    const openWebcamCaptureThis = this.openWebcamCapture.bind(this);
    this.webcamSrv.subscribe(openWebcamCaptureThis);
  }

  private openWebcamCapture(payload: WebcamRequestData) {
    this.isActive = true;
    this.step = 1;
    this.sysImage = '';
  }

  cancelCapture() {
    this.webcamSrv.sendResponse({
      canceled: true,
    });
    this.isActive = false;
  }

  switchImage() {
    // Call change image
  }

  dischargeImage() {
    this.step = 1;
    this.sysImage = '';
  }

  acceptImage() {
    this.webcamSrv.sendResponse({
      canceled: false,
      base64: this.sysImage,
    });
    this.isActive = false;
  }

  public getSnapshot(): void {
    this.trigger.next(void 0);
    this.step = 2;
  }
  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  public handleInitError(error: WebcamInitError): void {
    if (
      error.mediaStreamError &&
      error.mediaStreamError.name === 'NotAllowedError'
    ) {
      console.warn('Camera access was not allowed by user!');
    }
  }
}
