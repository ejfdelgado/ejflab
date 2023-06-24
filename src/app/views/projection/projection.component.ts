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
} from 'src/app/libs/threejs/threejs-projection/threejs-projection.component';
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
import { MenuControlComponent } from './components/menu-control/menu-control.component';
import { ThreejsCameraComponent } from 'src/app/libs/threejs/threejs-camera/threejs-camera.component';

export interface Model3DData {
  name: string;
  objUrl?: string;
  videoUrl?: string;
  useLoop?: boolean;
  startTime: number;
  texture: VideoCanvasOptions;
}

export interface ViewModelData {
  name: string;
  fov: number;
  pairs: CalibData;
}

export interface GlobalModelData {
  globalState: {
    playingState?: string; //stoped|preparing
    playTime?: number;
  };
  calib: {
    [key: string]: ViewModelData;
  };
  models: {
    [key: string]: Model3DData;
  };
  sand: {
    cameraId: string | null;
    meshUrl: string | null;
    meshUrl2: string | null;
    map3d2dUrl: string;
  };
}

export interface LocalModelData {
  currentTab: string;
  currentViewName: string | null;
  currentEnvironment: string | null;
  currentView: ViewModelData | null;
  useVideo: boolean;
  timeSeconds: number;
}

export interface TheStateViewData {
  openedFloatingMenu: boolean;
  fullScreen: boolean;
  seeCalibPoints: boolean;
  selectedDot: string | null;
  currentPlayTime: number;
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
  @ViewChild('camera_ref') cameraRef: ElementRef;
  @ViewChild('menuControlRef') menuControlRef: ElementRef;
  public resizeSceneLocalThis: Function;
  public extraOptions: Array<OptionData> = [];
  private observer?: any;
  public elem: any;
  public states: TheStateViewData = {
    openedFloatingMenu: false,
    fullScreen: false,
    seeCalibPoints: false,
    selectedDot: null,
    currentPlayTime: 0,
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
    globalState: {
      playingState: 'stoped',
      playTime: 0,
    },
    calib: {},
    models: {},
    sand: {
      cameraId: null,
      meshUrl: null,
      meshUrl2: null,
      map3d2dUrl: '',
    },
  };
  public localModel: LocalModelData = {
    currentTab: 'sand', //play|sand
    currentViewName: null,
    currentView: null,
    useVideo: false,
    timeSeconds: 0,
    currentEnvironment: 'video', //3d|video
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

    this.resizeSceneLocalThis = this.resizeSceneLocal.bind(this);
  }

  async askcompute3d2DMaskEvent() {
    // Ask the threejs camera...
    const camera = this.getCameraComponent();
    if (!camera) {
      return;
    }
    const points3d = camera.get3dPointsSand2();
    if (points3d.length > 0) {
      this.calibCamera(points3d);
    }
  }

  getSelf() {
    return this;
  }

  askPlayVideo(idCamera: string) {
    const cameraComponent = this.getCameraComponent();
    if (!cameraComponent) {
      return;
    }
    cameraComponent.useCamera(idCamera);
  }

  changedView(view: ViewModelData) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent || !threeComponent.scene) {
      return;
    }
    threeComponent.scene.resetView();
  }

  changedFov(dato: number) {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent || !threeComponent.scene) {
      return;
    }
    threeComponent.scene.setFov(dato);
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
    this.completeDefaults(this.mymodel);
    super.onTupleNews();
  }

  completeDefaults(mymodel: any) {
    //console.log(JSON.stringify(mymodel, null, 4));
    if (!mymodel.sand) {
      mymodel.sand = {
        cameraId: null,
        meshUrl: null,
      };
    }
    if (!mymodel.models) {
      mymodel.models = {};
    }
    if (!mymodel.globalState) {
      mymodel.globalState = {
        playingState: 'stoped',
        playTime: 0,
      };
    }
    if (!mymodel.calib) {
      mymodel.calib = {};
    }
  }

  override async onTupleReadDone() {
    this.addKeyListener(
      'data.globalState.playTime',
      (key: string, value: any) => {
        if (typeof value == 'number') {
          this.getMenuControlComponent().configureTimerToPlay(value);
        }
      }
    );
    if (!this.tupleModel.data) {
      this.tupleModel.data = {};
    }
    this.mymodel = this.tupleModel.data;
    this.completeDefaults(this.mymodel);
    super.onTupleReadDone();
    await this.refresh3dModels();
  }

  async refresh3dModels() {
    if (this.localModel.currentEnvironment !== '3d') {
      return;
    }
    // Itero los modelos y los cargo...
    this.removeAllMyObjects();
    const models = this.mymodel.models;
    const promesas = [];
    if (models != null && models != undefined) {
      const llaves = Object.keys(models);
      for (let i = 0; i < llaves.length; i++) {
        const uid = llaves[i];
        const modelo = models[uid];
        if (modelo.objUrl) {
          promesas.push(this.add3DObject(uid, modelo.objUrl, false));
        }
      }
    }
    await Promise.all(promesas);
    this.recomputeVertex();
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

  removeAllMyObjects() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return;
    }
    threeComponent.scene?.removeAllMyObjects();
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

  async askEraseAllPoints() {
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
    this.localModel.currentView.pairs = {};
    this.saveAll();
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

  resizeSceneLocal() {
    const resizeSceneThis = this.resizeScene.bind(this);
    const refresh3dModelsThis = this.refresh3dModels.bind(this);
    const reference = setInterval(() => {
      const respuesta = resizeSceneThis();
      if (respuesta) {
        refresh3dModelsThis();
        clearInterval(reference);
      }
    }, 300);
  }

  resizeScene() {
    const threeComponent = this.getThreeComponent();
    if (!threeComponent) {
      return false;
    }
    threeComponent.onResize({});
    return true;
  }

  async calibCamera(points3d: Array<Array<number>> = []) {
    const threeComponent = this.getThreeComponent();
    if (!this.localModel.currentView || !threeComponent) {
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
    const payload: SolvePnPData = {
      v2: [],
      v3: [],
      size: [[boundsCamera.width, boundsCamera.height]],
      focal: [[focalLengthCamera, focalLengthCamera]],
    };
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const actual = pairs[key];
      if (!actual.v2 || !actual.v3) {
        continue;
      }
      payload.v2.push([
        actual.v2.x * boundsCamera.width,
        actual.v2.y * boundsCamera.height,
      ]);
      payload.v3.push([actual.v3.x, actual.v3.y, actual.v3.z]);
    }

    //Se agregan los puntos en 3d que se desean proyectar
    if (points3d.length > 0) {
      payload.points3d = points3d;
    }

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

  getMenuControlComponent(): MenuControlComponent {
    if (!this.menuControlRef) {
      throw new Error('No hay menu control');
    }
    const componentReal = this
      .menuControlRef as unknown as MenuControlComponent;
    if (!componentReal) {
      throw new Error('No hay three component');
    }
    return componentReal;
  }

  getCameraComponent() {
    if (!this.cameraRef) {
      return null;
    }
    const componentReal = this.cameraRef as unknown as ThreejsCameraComponent;
    if (!componentReal) {
      return null;
    }
    return componentReal;
  }

  getThreeComponent() {
    if (this.localModel.currentEnvironment == '3d') {
      if (!this.threeRef) {
        return null;
      }
      const threejsComponent = this
        .threeRef as unknown as ThreejsProjectionComponent;
      if (!threejsComponent) {
        return null;
      }
      return threejsComponent;
    } else {
      const camera = this.getCameraComponent();
      if (!camera) {
        return null;
      }
      return camera.getThreeComponent();
    }
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
