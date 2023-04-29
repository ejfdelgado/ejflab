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

export interface ScrollNavData {
  columnName: string;
  valueAssinged: string;
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
    spaceWidth: null,
    scrollWidth: 150,
    amount: 1,
    nshow: 10, // Cuantos pasos muestro en un momento dado
  };
  public window: Array<any>;
  static STEP_COLORS: any = {
    '0': '#FFFFFF',
    '1': '#FF0000',
    '2': '#00FF00',
  };
  constructor(public cdr: ChangeDetectorRef) {
    this.model = {
      columnName: 'out',
      valueAssinged: '1',
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

  ngOnInit(): void {}

  getStepColor(step: any) {
    return ScrollnavComponent.STEP_COLORS[step.out];
  }

  computeDimensions() {
    const scrollEl = this.scrollParentEl.nativeElement;
    this.scroll.spaceWidth = scrollEl.getBoundingClientRect().width;
    this.scroll.amount = Math.max(10, Math.ceil(this.scroll.spaceWidth / 100));
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
      this.computeWindow();
    }
  }

  onMouseWheel(ev: WheelEvent) {
    if (ev.deltaY < 0) {
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
    this.computeWindow();
  }

  mouseDownScroll(ev: MouseEvent) {
    this.dragging.target = 'scroll';
    this.dragging.startv = this.scroll.left;
    this.dragging.startx = ev.screenX;
  }

  mouseUpScroll(ev: MouseEvent) {
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

  moveInTime(ev: WheelEvent) {
    if (ev.deltaY < 0) {
      // move back
      this.scroll.left = this.scroll.left + this.scroll.amount;
    } else {
      // move forward
      this.scroll.left = this.scroll.left - this.scroll.amount;
    }
    this.clampScroll();
    this.computeWindow();
  }

  clampScroll() {
    if (this.scroll.left < 0) {
      this.scroll.left = 0;
    }
    const max = this.scroll.spaceWidth - this.scroll.scrollWidth;
    if (this.scroll.left >= max) {
      this.scroll.left = max;
    }
  }

  computeWindow() {
    setTimeout(() => {
      const max = this.scroll.spaceWidth - this.scroll.scrollWidth;
      const porcentaje = this.scroll.left / max;
      const nShow = this.scroll.nshow;
      const total = this.data.length;
      if (total <= nShow) {
        this.window = this.data;
      } else {
        const indiceFinal = total - nShow;
        const ixStart = Math.floor(indiceFinal * porcentaje);
        const ixEnd = ixStart + nShow;
        this.window = this.data.filter((el, ix) => {
          return ix >= ixStart && ix < ixEnd;
        });
      }
    }, 0);
  }
}
