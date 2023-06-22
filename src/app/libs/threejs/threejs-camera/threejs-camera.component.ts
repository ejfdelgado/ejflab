import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HttpService } from 'src/services/http.service';
import { ThreejsProjectionComponent } from '../threejs-projection/threejs-projection.component';

@Component({
  selector: 'app-threejs-camera',
  templateUrl: './threejs-camera.component.html',
  styleUrls: ['./threejs-camera.component.css'],
})
export class ThreejsCameraComponent implements OnInit {
  @ViewChild('three_ref') threeRef: ElementRef;
  @ViewChild('video') videoRef: ElementRef;
  @ViewChild('threejs_parent') threejsParent: ElementRef;
  @Input() parent: any;
  videoWidth: number | null = null;
  videoHeight: number | null = null;
  forcedWidth: number = 0;
  forcedLeft: number = 0;
  constructor(private readonly httpSrv: HttpService) {}

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

  getThreeComponent() {
    if (!this.threeRef) {
      return null;
    }
    const threejsComponent = this
      .threeRef as unknown as ThreejsProjectionComponent;
    if (!threejsComponent) {
      return null;
    }
    return threejsComponent;
  }

  removeAllMyObjects() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.removeAllMyObjects();
  }

  async recomputeVertex() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.recomputeVertex();
  }

  async add3DObject(uid: string, url: string | null, recomputeVertex: boolean) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent || url == null) {
      return;
    }
    // Load the url
    const object: any = await this.httpSrv.get(url, { isBlob: true });
    const nextUrl = URL.createObjectURL(object);
    await threeComponent.scene?.loadObj(nextUrl, uid);
    URL.revokeObjectURL(nextUrl);
    if (recomputeVertex) {
      this.recomputeVertex();
    }
  }

  async refresh3dModels() {
    // Itero los modelos y los cargo...
    this.removeAllMyObjects();
    const promesas: Array<any> = [];
    //promesas.push(this.add3DObject("unique_mesh", modelo.objUrl, false));
    await Promise.all(promesas);
    this.recomputeVertex();
  }

  resizeScene() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return false;
    }
    threeComponent.onResize({});
    return true;
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
    this.resizeScene();
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    this.resizeComponents();
  }
}
