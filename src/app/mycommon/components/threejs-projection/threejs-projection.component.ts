import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BasicScene, DotModelData, KeyValueDotModelData } from './BasicScene';

export interface CalibData {
  [key: string]: DotModelData;
}

@Component({
  selector: 'app-threejs-projection',
  templateUrl: './threejs-projection.component.html',
  styleUrls: ['./threejs-projection.component.css'],
})
export class ThreejsProjectionComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @ViewChild('mycanvas') canvasRef: ElementRef;
  @ViewChild('myparent') prentRef: ElementRef;
  scene: BasicScene | null = null;
  bounds: DOMRect | null = null;
  DOT_OPTIONS: any = {
    border: 3,
    size: 8,
    style: null,
  };
  selectedDot: string | null = null;
  @Output() selectedDotEvent = new EventEmitter<string | null>();
  @Output() modelChangedEvent = new EventEmitter<void>();
  @Input() DOTS_MODEL: CalibData | null;
  @Input() seeCalibPoints: boolean;

  constructor() {
    const style: any = {};
    style['border-width'] = this.DOT_OPTIONS.border + 'px';
    style['width'] = this.DOT_OPTIONS.size + 'px';
    style['height'] = this.DOT_OPTIONS.size + 'px';
    const tam = (
      (-1 * (this.DOT_OPTIONS.size + 2 * this.DOT_OPTIONS.border)) /
      2
    ).toFixed(0);
    style['left'] = tam + 'px';
    style['top'] = tam + 'px';
    this.DOT_OPTIONS.style = style;
  }

  ngOnChanges(changes: any) {
    if (!this.scene) {
      return;
    }
    if (changes.seeCalibPoints) {
      const actual = changes.seeCalibPoints.currentValue;
      this.scene.setCalibPointsVisibility(actual);
      this.scene.setSeeCalibPoints(actual);
    }
  }

  select2DPoint(dotData: KeyValueDotModelData) {
    //console.log(`${key} ${JSON.stringify(dot)}`);
    if (!this.scene) {
      return;
    }
    const key = dotData.key;
    this.selectedDot = key;
    this.selectedDotEvent.emit(this.selectedDot);
    this.scene.selectKeyPoint(key);
  }

  get2DCoordinates(dotData: KeyValueDotModelData) {
    if (!this.scene || !dotData.value.v2) {
      return {};
    }
    const bounds = this.scene.bounds;
    const key = dotData.key;
    const dot = dotData.value;
    const style: any = {};
    if (dot.v2) {
      style['left'] = dot.v2.x * bounds.width + 'px';
      style['top'] = dot.v2.y * bounds.height + 'px';
    }
    return style;
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    this.computeDimensions();
    if (this.scene != null && this.bounds != null) {
      this.scene.setBounds(this.bounds);
    }
  }

  @HostListener('click', ['$event'])
  onMouseClick(event: MouseEvent) {
    if (!this.scene || !this.DOTS_MODEL) {
      return;
    }
    const canvasEl = this.canvasRef.nativeElement;
    const bounds = canvasEl.getBoundingClientRect();
    this.scene.onMouseClick(event, bounds);
    if (event.ctrlKey) {
      // Validar si hay seleccionado
      if (this.selectedDot != null) {
        // Debo capturar la posición x y y
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        if (!(this.selectedDot in this.DOTS_MODEL)) {
          // En caso de que haya 3d seleccionado, se agrega
          const recuperado = this.scene.getSelectedVertex();
          if (recuperado) {
            this.DOTS_MODEL[this.selectedDot] = recuperado.value;
          }
        }
        this.DOTS_MODEL[this.selectedDot].v2 = { x, y };
        this.modelChangedEvent.emit();
      }
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(ev: MouseEvent) {
    if (!this.scene) {
      return;
    }
    const canvasEl = this.canvasRef.nativeElement;
    const bounds = canvasEl.getBoundingClientRect();
    this.scene.onMouseMove(ev, bounds);
  }

  removeSelectedPoint() {
    if (!this.selectedDot || !this.DOTS_MODEL) {
      return;
    }
    if (this.selectedDot in this.DOTS_MODEL) {
      delete this.DOTS_MODEL[this.selectedDot];
      this.modelChangedEvent.emit();
    }
  }

  listenSelected3DPoint(data: KeyValueDotModelData) {
    if (!this.DOTS_MODEL) {
      return;
    }
    if (data == null) {
      this.selectedDot = null;
      this.selectedDotEvent.emit(this.selectedDot);
    } else {
      this.selectedDot = data.key;
      this.selectedDotEvent.emit(this.selectedDot);
      if (!(data.key in this.DOTS_MODEL)) {
        this.DOTS_MODEL[data.key] = data.value;
        this.modelChangedEvent.emit();
      }
    }
  }

  ngAfterViewInit(): void {
    this.computeDimensions();
    if (this.bounds == null) {
      return;
    }
    const theCanvas = this.canvasRef.nativeElement;
    this.scene = new BasicScene(theCanvas, this.bounds);
    this.scene.initialize();
    const listenSelected3DPointThis = this.listenSelected3DPoint.bind(this);
    this.scene.dot3DSelected.subscribe(listenSelected3DPointThis);
    this.loop();
  }

  loop() {
    if (this.scene != null && this.scene.camera) {
      this.scene.camera?.updateProjectionMatrix();
      this.scene.update();
      this.scene.renderer?.render(this.scene, this.scene.camera);
      this.scene.orbitals?.update();
      requestAnimationFrame(() => {
        this.loop();
      });
    }
  }

  public computeDimensions() {
    const scrollEl = this.prentRef.nativeElement;
    this.bounds = scrollEl.getBoundingClientRect();
  }

  ngOnInit(): void {}

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey && event.shiftKey) {
      switch (event.code) {
        case 'NumpadMultiply':
          this.removeSelectedPoint();
          break;
        default:
        //console.log(event.code);
      }
    }
  }
}
