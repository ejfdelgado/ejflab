import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';
import { DOCUMENT } from '@angular/common';
import { OpenCVService, SolvePnPData } from 'src/services/opencv.service';
import {
  CalibData,
  ThreejsProjectionComponent,
} from 'src/app/mycommon/components/threejs-projection/threejs-projection.component';
import { BaseComponent } from 'src/app/components/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TupleService } from 'src/services/tuple.service';
import { FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { WebcamService } from 'src/services/webcam.service';
import { LoginService } from 'src/services/login.service';
import { HttpService } from 'src/services/http.service';
import {
  VideoCanvasEventData,
  VideoCanvasOptions,
} from './components/video-canvas/video-canvas.component';

export interface Model3DData {
  name: string;
  objUrl?: string;
  videoUrl?: string;
  startTime: number;
  texture: VideoCanvasOptions;
}

export interface ViewModelData {
  name: string;
  fov: number;
  pairs: CalibData;
}

export interface GlobalModelData {
  calib: {
    [key: string]: ViewModelData;
  };
  models: {
    [key: string]: Model3DData;
  };
}

export interface LocalModelData {
  currentTab: string;
  currentViewName: string | null;
  currentView: ViewModelData | null;
  useVideo: boolean;
  timeSeconds: number;
}

export interface TheStateViewData {
  openedFloatingMenu: boolean;
  fullScreen: boolean;
  seeCalibPoints: boolean;
  selectedDot: string | null;
  menuTop: {
    dragging: boolean;
    right: number;
    bottom: number;
    startx: number;
    starty: number;
    oldBottom: number;
    oldRight: number;
  };
}

/*
TODO
- Floating workspace...
- Edit FOV 10 - 70 degrees -> make part of model
*/

@Component({
  selector: 'app-projection',
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css'],
})
export class ProjectionComponent
  extends BaseComponent
  implements OnInit, OnChanges
{
  @ViewChild('three_ref') threeRef: ElementRef;
  public extraOptions: Array<OptionData> = [];
  private observer?: any;
  public elem: any;
  public states: TheStateViewData = {
    openedFloatingMenu: false,
    fullScreen: false,
    seeCalibPoints: false,
    selectedDot: null,
    menuTop: {
      dragging: false,
      right: 0,
      bottom: 0,
      startx: 0,
      starty: 0,
      oldBottom: 10,
      oldRight: 10,
    },
  };
  public mymodel: GlobalModelData = {
    calib: {},
    models: {},
  };
  public localModel: LocalModelData = {
    currentTab: 'views',
    currentViewName: null,
    currentView: null,
    useVideo: false,
    timeSeconds: 0,
  };

  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService,
    public override fileService: FileService,
    public override modalService: ModalService,
    public override webcamService: WebcamService,
    public loginSrv: LoginService,
    //
    @Inject(DOCUMENT) private document: any,
    private opencvSrv: OpenCVService,
    private readonly httpSrv: HttpService
  ) {
    super(
      route,
      pageService,
      cdr,
      authService,
      dialog,
      tupleService,
      fileService,
      modalService,
      webcamService
    );
    this.extraOptions.push({
      action: () => {
        this.calibCamera();
      },
      icon: 'directions_run',
      label: 'Calibrate Camera',
    });
    this.extraOptions.push({
      action: () => {
        this.useOrbitControls();
      },
      icon: 'directions_run',
      label: 'Use Orbit Controls',
    });
    this.extraOptions.push({
      action: () => {
        this.switchCalibPoints();
      },
      icon: 'directions_run',
      label: 'Switch Calib Points',
    });
  }

  async saveAll() {
    this.saveTuple();
  }

  ngOnChanges(changes: any) {
    //console.log(JSON.stringify(changes));
    /*if (changes.seeCalibPoints) {
      const actual = changes.seeCalibPoints.currentValue;

    }
    */
  }

  receiveVideo(event: VideoCanvasEventData) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.assignMaterial(event);
  }

  override onTupleNews() {
    this.mymodel = this.tupleModel.data;
    super.onTupleNews();
  }

  override async onTupleReadDone() {
    if (!this.tupleModel.data) {
      this.tupleModel.data = {
        calib: {},
      };
    }
    this.mymodel = this.tupleModel.data;
    super.onTupleReadDone();
    // Itero los modelos y los cargo...
    const models = this.mymodel.models;
    const llaves = Object.keys(models);
    const promesas = [];
    for (let i = 0; i < llaves.length; i++) {
      const uid = llaves[i];
      const modelo = models[uid];
      if (modelo.objUrl) {
        promesas.push(this.add3DObject(uid, modelo.objUrl, false));
      }
    }
    await Promise.all(promesas);
    this.recomputeVertex();
    console.log('Read OK!');
  }

  async recomputeVertex() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.recomputeVertex();
  }

  override onTupleWriteDone() {
    console.log('Writed OK!');
  }

  closeFloating() {
    this.states.openedFloatingMenu = false;
  }

  override async ngOnInit() {
    await super.ngOnInit();
    this.elem = document.documentElement;
    this.initResizeObserver();
  }

  getCurrentPair() {
    if (!this.localModel.currentView) {
      return null;
    }
    return this.localModel.currentView.pairs;
  }

  switchCalibPoints() {
    this.states.seeCalibPoints = !this.states.seeCalibPoints;
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

  remove3DObject(uid: string) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.removeObjectByName(uid);
    this.recomputeVertex();
  }

  async askErasePoint(key: string) {
    if (!this.localModel.currentView) {
      return;
    }
    const response = await this.modalService.confirm({
      txt: 'Esta acción no se puede deshacer',
      title: '¿Seguro?',
    });
    if (!response) {
      return;
    }
    if (key in this.localModel.currentView.pairs) {
      delete this.localModel.currentView.pairs[key];
    }
    this.saveAll();
  }

  askLocatePoint(key: string) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.select2DPoint({ key, value: { v3: { x: 0, y: 0, z: 0 } } });
  }

  useOrbitControls() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.setOrbitControls(true);
  }

  resizeScene() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.onResize({});
  }

  async calibCamera() {
    const threeComponent = this.getThreeComponent();
    if (!this.localModel.currentView || !this.threeRef || !threeComponent) {
      return;
    }
    const bounds = threeComponent.bounds;
    const scene = threeComponent.scene;
    const camera = scene?.camera;
    if (!bounds || !scene || !camera) {
      return;
    }
    const pairs = this.localModel.currentView.pairs;
    const keys = Object.keys(pairs);

    //Returns the focal length of the current .fov in respect to .filmGauge.
    const focalLengthCamera = camera.getFocalLength();

    const boundsCamera = {
      width: camera.getFilmWidth(),
      height: camera.getFilmHeight(),
    };
    //camera.setFocalLength(23);
    const payload: SolvePnPData = {
      v2: [],
      v3: [],
      size: [[boundsCamera.width, boundsCamera.height]],
      focal: [[focalLengthCamera, focalLengthCamera]],
    };
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const actual = pairs[key];
      if (!actual.v2) {
        continue;
      }
      payload.v2.push([
        actual.v2.x * boundsCamera.width,
        actual.v2.y * boundsCamera.height,
      ]);
      payload.v3.push([actual.v3.x, actual.v3.y, actual.v3.z]);
    }
    //console.log(JSON.stringify(payload, null, 4));
    const response = await this.opencvSrv.solvePnP(payload);
    if (response && response.aux && response.tvec && response.t) {
      if (threeComponent.scene) {
        threeComponent.scene.calibCamera(response.t);
      }
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.observer?.unobserve(this.elem);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      this.elem.msRequestFullscreen();
    }
  }

  closeFullscreen() {
    if (typeof document.exitFullscreen == 'function') {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      this.document.msExitFullscreen();
    }
  }

  isInUserFullscreenMode() {
    return !!this.document.fullscreenElement;
  }

  isInFullscreenMode() {
    let isFullScreen =
      this.isInUserFullscreenMode() ||
      (<any>window).fullScreen ||
      (window.innerWidth === screen.width &&
        window.innerHeight === screen.height);
    return isFullScreen;
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullscreenChange() {
    this.cdr.detectChanges();
    this.states.fullScreen = this.isInFullscreenMode();
    console.log(`onFullscreenChange ${this.states.fullScreen}`);
    this.updateComponentsToFullScreen();
  }

  initResizeObserver() {
    this.observer = new (<any>window).ResizeObserver((entries: any) => {
      this.cdr.detectChanges();
      this.states.fullScreen = this.isInFullscreenMode();
      setTimeout(() => {
        console.log(`ResizeObserver ${this.states.fullScreen}`);
        this.updateComponentsToFullScreen();
      }, 0);
    });

    this.observer.observe(this.elem);
  }

  mouseDownMenuTop(ev: MouseEvent) {
    this.states.menuTop.dragging = true;
    this.states.menuTop.startx = ev.screenX;
    this.states.menuTop.starty = ev.screenY;
    this.states.menuTop.oldBottom = this.states.menuTop.bottom;
    this.states.menuTop.oldRight = this.states.menuTop.right;
  }

  mouseUpMenuTop(ev: MouseEvent) {
    this.states.menuTop.dragging = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(ev: any) {
    if (this.states.menuTop.dragging) {
      const menuTop = this.states.menuTop;
      menuTop.bottom = menuTop.oldBottom + (menuTop.starty - ev.screenY);
      menuTop.right = menuTop.oldRight + (menuTop.startx - ev.screenX);
    }
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

  updateComponentsToFullScreen() {
    if (this.states.fullScreen) {
      this.states.openedFloatingMenu = true;
      this.states.menuTop.bottom = this.states.menuTop.oldBottom;
      this.states.menuTop.right = this.states.menuTop.oldRight;
    } else {
      this.states.openedFloatingMenu = false;
      this.states.menuTop.oldBottom = this.states.menuTop.bottom;
      this.states.menuTop.oldRight = this.states.menuTop.right;
      this.states.menuTop.bottom = 0;
      this.states.menuTop.right = 0;
    }
    this.resizeScene();
  }

  turnFullscreen(value: boolean) {
    this.states.fullScreen = value;
    this.updateComponentsToFullScreen();
    if (this.states.fullScreen) {
      this.openFullscreen();
    } else {
      this.closeFullscreen();
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey && event.shiftKey) {
      switch (event.code) {
        case 'NumpadAdd':
          this.turnFullscreen(!this.states.fullScreen);
          break;
        default:
        //console.log(event.code);
      }
    }
  }
}
