import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-threejs-camera',
  templateUrl: './threejs-camera.component.html',
  styleUrls: ['./threejs-camera.component.css'],
})
export class ThreejsCameraComponent implements OnInit {
  @ViewChild('video') videoRef: ElementRef;
  @ViewChild('threejs_parent') threejsParent: ElementRef;
  videoWidth: number | null = null;
  videoHeight: number | null = null;
  forcedWidth: number = 0;
  forcedLeft: number = 0;
  constructor() {}

  ngOnInit(): void {}

  async useCamera(deviceId: string) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId,
      },
    });
    const videoEl = this.videoRef.nativeElement;
    videoEl.srcObject = stream;
    const playResponse = videoEl.play();
    await playResponse;
    this.videoWidth = videoEl.videoWidth;
    this.videoHeight = videoEl.videoHeight;
    this.resizeComponents();
  }

  resizeComponents() {
    const clientWidth = this.threejsParent.nativeElement.clientWidth;
    const clientHeight = this.threejsParent.nativeElement.clientHeight;
    if (this.videoWidth == null || this.videoHeight == null) {
      return;
    }
    const ratio = this.videoWidth / this.videoHeight;
    this.forcedWidth = Math.floor(ratio * clientHeight);
    this.forcedLeft = Math.floor((clientWidth - this.forcedWidth) / 2);
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    this.resizeComponents();
  }
}
