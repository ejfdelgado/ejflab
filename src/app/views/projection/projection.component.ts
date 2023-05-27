import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
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

export interface ViewModelData {
  name: string;
  pairs: CalibData;
}

export interface GlobalModelData {
  calib: {
    [key: string]: ViewModelData;
  };
}

@Component({
  selector: 'app-projection',
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css'],
})
export class ProjectionComponent implements OnInit {
  @ViewChild('three_ref') threeRef: ElementRef;
  public extraOptions: Array<OptionData> = [];
  public fullScreen: boolean = false;
  private observer?: any;
  public elem: any;
  public mymodel: GlobalModelData = {
    calib: {
      a: {
        name: 'Projector #1',
        pairs: {},
      },
    },
  };
  public currentView: ViewModelData | null = this.mymodel.calib['a'];

  constructor(
    @Inject(DOCUMENT) private document: any,
    private changeDetectorRef: ChangeDetectorRef,
    private opencvSrv: OpenCVService
  ) {
    this.extraOptions.push({
      action: () => {
        this.solvePnP();
      },
      icon: 'directions_run',
      label: 'Calibrate Camera',
    });
  }

  ngOnInit(): void {
    this.elem = document.documentElement;
    this.initResizeObserver();
  }

  getCurrentPair() {
    if (!this.currentView) {
      return null;
    }
    return this.currentView.pairs;
  }

  async solvePnP() {
    if (!this.currentView || !this.threeRef) {
      return;
    }
    const threejsComponent = this
      .threeRef as unknown as ThreejsProjectionComponent;
    const bounds = threejsComponent.bounds;
    if (!bounds) {
      return;
    }
    const pairs = this.currentView.pairs;
    const keys = Object.keys(pairs);
    const payload: SolvePnPData = {
      v2: [],
      v3: [],
    };
    const aspectRatio = bounds.height / bounds.width;
    console.log(`${bounds.width}x${bounds.height} = ${aspectRatio}`);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const actual = pairs[key];
      if (!actual.v2) {
        continue;
      }
      payload.v2.push([
        //actual.v2.x * bounds.width / 100,
        //actual.v2.y * bounds.height / 100,
        actual.v2.x * aspectRatio * 10,
        actual.v2.y * 10,
      ]);
      payload.v3.push([actual.v3.x, actual.v3.y, actual.v3.z]);
    }
    const response = await this.opencvSrv.solvePnP(payload);
    if (response && response.aux && response.tvec) {
      if (threejsComponent.scene) {
        threejsComponent.scene.updateProjectionMatrix(
          response.aux,
          response.tvec
        );
      }
    }
  }

  ngOnDestroy() {
    this.observer?.unobserve(this.elem);
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (typeof document.exitFullscreen == 'function') {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }

  isInUserFullscreenMode() {
    return !!this.document.fullscreenElement;
  }

  isInFullscreenMode() {
    return (
      this.isInUserFullscreenMode() ||
      (<any>window).fullScreen ||
      (window.innerWidth === screen.width &&
        window.innerHeight === screen.height)
    );
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  @HostListener('document:mozfullscreenchange')
  @HostListener('document:MSFullscreenChange')
  onFullscreenChange() {
    this.changeDetectorRef.detectChanges();
  }

  initResizeObserver() {
    this.observer = new (<any>window).ResizeObserver((entries: any) => {
      this.changeDetectorRef.detectChanges();
    });

    this.observer.observe(this.elem);
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey && event.shiftKey) {
      switch (event.code) {
        case 'NumpadAdd':
          this.fullScreen = !this.fullScreen;
          if (this.fullScreen) {
            this.openFullscreen();
          } else {
            this.closeFullscreen();
          }
          break;
        default:
        //console.log(event.code);
      }
    }
  }
}
