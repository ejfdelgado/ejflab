import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MyColor } from 'srcJs/MyColor.js';

export interface ScrollNavData {
  columnName: string;
  elwidth: number;
  startix: number;
}

@Component({
  selector: 'app-scrollnav',
  templateUrl: './scrollnav.component.html',
  styleUrls: ['./scrollnav.component.css'],
})
export class ScrollnavComponent implements OnInit, AfterViewInit {
  @ViewChild('scroll_parent') scrollParentEl: ElementRef;
  public model: ScrollNavData;
  data: Array<any>;
  public currentClass: any = {
    number: 0,
    color: '#FFFFFF',
  };
  public PLAY_STATE_VISUAL: any = {
    play: { text: 'Play', icon: 'play_arrow' },
    pause: { text: 'Pause', icon: 'pause' },
  };
  public playState: any = {
    state: 'pause',
  };
  public dragging: any = {
    target: null,
    startv: null,
    startx: null,
    deltax: null,
    starty: null,
    deltay: null,
  };
  public scroll: any = {
    left: 0,
    leftPer: 0,
    realIndex: 0,
    realIndexPer: 0,
    spaceWidth: null,
    xLeft: null,
    scrollWidth: 150,
    amount1: 1,
    amount2: 10,
    nshow: 10, // Cuantos pasos muestro en un momento dado
  };
  public window: Array<any>;
  static STEP_COLORS: any = MyColor.getStepColors(32);
  constructor(public cdr: ChangeDetectorRef) {
    this.model = {
      columnName: 'out',
      elwidth: 5,
      startix: 0,
    };
    this.data = [
      { d1: 1, d2: 4, out: 2 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 2 },
    ];
    this.window = [];
  }

  computeCurrentColorClass() {
    this.currentClass.color =
      ScrollnavComponent.STEP_COLORS[this.currentClass.number];
  }

  currentClassChanged(arg: any) {
    if (arg < 0) {
      setTimeout(() => {
        this.currentClass.number = 0;
        this.computeCurrentColorClass();
        this.cdr.detectChanges();
      }, 0);
    } else {
      setTimeout(() => {
        this.computeCurrentColorClass();
      }, 0);
    }
  }

  togglePlayPause() {
    if (this.playState.state == 'pause') {
      this.playState.state = 'play';
    } else {
      this.playState.state = 'pause';
    }
  }

  ngOnInit(): void {}

  getStepColor(step: any) {
    return ScrollnavComponent.STEP_COLORS[step[this.model.columnName]];
  }

  computeDimensions() {
    const scrollEl = this.scrollParentEl.nativeElement;
    const bounds = scrollEl.getBoundingClientRect();
    this.scroll.xLeft = bounds.left;
    this.scroll.spaceWidth = bounds.width;
  }

  ngAfterViewInit(): void {
    this.computeDimensions();
    this.computeWindow();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.computeDimensions();
    this.computeWindow();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(ev: any) {
    if (this.dragging.target == 'scroll') {
      this.scroll.left =
        this.dragging.startv + (ev.screenX - this.dragging.startx);
      this.clampScroll();
      this.computeRealIndexFromLeft();
      this.computeWindow();
    } else if (this.dragging.target == 'steps') {
      const delta = ev.screenX - this.dragging.startx;
      const selectedStep = this.getRealStep(delta);
      this.assignCurrentClassToStep(selectedStep);
    } else if (this.dragging.target == 'stepplay') {
      const delta = ev.screenX - this.dragging.startx;
      const selectedStep = this.getRealStep(delta);
      console.log(`Ask to show in 3d renderer ${JSON.stringify(selectedStep)}`);
    }
  }

  assignCurrentClassToStep(selectedStep: any) {
    selectedStep[this.model.columnName] = this.currentClass.number;
  }

  getRealStep(delta: number) {
    const startv = this.dragging.startv;
    const xLeft = this.scroll.xLeft;
    const spaceWidth = this.scroll.spaceWidth;
    const nshow = this.scroll.nshow;

    const realX = startv - xLeft + delta;
    const custoWidth = spaceWidth / nshow;
    let myVal = Math.floor(realX / custoWidth) + this.scroll.realIndex;
    if (myVal < 0) {
      myVal = 0;
    }
    if (myVal >= this.data.length) {
      myVal = this.data.length - 1;
    }
    return this.data[myVal];
  }

  zoomInOut(deltaY: number) {
    if (deltaY < 0) {
      // zoom out
      this.scroll.nshow -= 1;
    } else {
      // zoom in
      this.scroll.nshow += 1;
    }
    if (this.scroll.nshow < 1) {
      this.scroll.nshow = 1;
    }
    const max = Math.min(this.scroll.spaceWidth, this.data.length);
    if (this.scroll.nshow > max) {
      // One step per pixel
      this.scroll.nshow = max;
    }
    //this.cdr.detectChanges();
    // Debo recalcular real index dado el scroll left
    this.computeRealIndexFromLeft();
    this.computeWindow();
  }

  onMouseWheel(ev: WheelEvent) {
    if (ev.shiftKey) {
      this.zoomInOut(ev.deltaY);
    } else {
      this.moveInTimeLocalReal(this.scroll.amount1, ev.deltaY);
    }
  }

  mouseDownScroll(ev: MouseEvent) {
    this.dragging.target = 'scroll';
    this.dragging.startv = this.scroll.left;
    this.dragging.startx = ev.screenX;
  }

  mouseUpScroll(ev: MouseEvent) {
    this.resetDragging();
  }

  mouseDownSteps(ev: MouseEvent) {
    if (ev.shiftKey) {
      this.dragging.target = 'steps';
    } else {
      this.dragging.target = 'stepplay';
    }
    //Options to get starting x point: .pageX .x .clientX
    this.dragging.startv = ev.x;
    this.dragging.startx = ev.screenX;

    if (this.dragging.target == 'steps') {
      const selectedStep = this.getRealStep(0);
      this.assignCurrentClassToStep(selectedStep);
    }
  }

  mouseUpSteps(ev: MouseEvent) {
    this.resetDragging();
  }

  resetDragging() {
    this.dragging = {
      target: null,
      startv: null,
      startx: null,
      deltax: null,
      starty: null,
      deltay: null,
    };
  }

  moveInTimeLocalReal(amount: number, deltaY: number) {
    if (deltaY < 0) {
      // move back
      this.scroll.realIndex = this.scroll.realIndex + amount;
    } else {
      // move forward
      this.scroll.realIndex = this.scroll.realIndex - amount;
    }
    this.clampRealIndex();
    // define left from real index
    const maxScroll = this.scroll.spaceWidth - this.scroll.scrollWidth;
    this.scroll.left = this.scroll.realIndexPer * maxScroll;
    this.clampScroll();
    this.computeWindow();
  }

  moveInTimeLocal(amount: number, deltaY: number) {
    if (deltaY < 0) {
      // move back
      this.scroll.left = this.scroll.left + amount;
    } else {
      // move forward
      this.scroll.left = this.scroll.left - amount;
    }
    this.clampScroll();
    // define real index from left
    this.computeRealIndexFromLeft();
    this.computeWindow();
  }

  computeRealIndexFromLeft() {
    const maxRealIndex = this.data.length - this.scroll.nshow;
    this.scroll.realIndex = Math.floor(maxRealIndex * this.scroll.leftPer);
  }

  moveInTime(ev: WheelEvent) {
    this.moveInTimeLocal(this.scroll.amount2, ev.deltaY);
  }

  clampRealIndex() {
    if (this.scroll.realIndex < 0) {
      this.scroll.realIndex = 0;
    }
    const max = this.data.length - this.scroll.nshow;
    if (this.scroll.realIndex > max) {
      this.scroll.realIndex = max;
    }
    if (max == 0) {
      this.scroll.realIndexPer = 0;
    } else {
      this.scroll.realIndexPer = this.scroll.realIndex / max;
    }
  }

  clampScroll() {
    if (this.scroll.left < 0) {
      this.scroll.left = 0;
    }
    const max = this.scroll.spaceWidth - this.scroll.scrollWidth;
    if (this.scroll.left > max) {
      this.scroll.left = max;
    }
    if (max == 0) {
      this.scroll.leftPer = 0;
    } else {
      this.scroll.leftPer = this.scroll.left / max;
    }
  }

  computeWindow() {
    setTimeout(() => {
      const total = this.data.length;
      if (total <= this.scroll.nshow) {
        this.window = this.data;
      } else {
        this.window = this.data.filter((el, ix) => {
          return (
            ix >= this.scroll.realIndex &&
            ix < this.scroll.realIndex + this.scroll.nshow
          );
        });
      }
    }, 0);
  }
}
