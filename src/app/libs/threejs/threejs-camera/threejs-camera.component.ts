import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-threejs-camera',
  templateUrl: './threejs-camera.component.html',
  styleUrls: ['./threejs-camera.component.css'],
})
export class ThreejsCameraComponent implements OnInit {
  @ViewChild('video') videoRef: ElementRef;
  constructor() {}

  ngOnInit(): void {}

  async useCamera(deviceId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId,
      },
    });
    this.videoRef.nativeElement.srcObject = stream;
    this.videoRef.nativeElement.play();
  }
}
