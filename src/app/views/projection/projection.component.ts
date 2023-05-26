import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnInit,
} from '@angular/core';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';
import { DOCUMENT } from '@angular/common';
import { OpenCVService } from 'src/services/opencv.service';
import { CalibData } from 'src/app/mycommon/components/threejs-projection/threejs-projection.component';

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
  ) {}

  ngOnInit(): void {
    this.elem = document.documentElement;
    this.initResizeObserver();
    this.solvePnP();
  }

  getCurrentPair() {
    if (!this.currentView) {
      return null;
    }
    return this.currentView.pairs;
  }

  async solvePnP() {
    const response = await this.opencvSrv.solvePnP({
      v2: [
        [282, 274],
        [397, 227],
        [577, 271],
        [462, 318],
        [270, 479],
        [450, 523],
        [566, 475],
      ],
      v3: [
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
      ],
    });
    console.log(JSON.stringify(response, null, 4));
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
          console.log(event.code);
      }
    }
  }
}
