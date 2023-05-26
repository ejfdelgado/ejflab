import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicScene } from './BasicScene';

export interface DotModelData {
  v2?: { x: number; y: number };
  v3: { x: number; y: number; z: number };
}

@Component({
  selector: 'app-threejs-projection',
  templateUrl: './threejs-projection.component.html',
  styleUrls: ['./threejs-projection.component.css'],
})
export class ThreejsProjectionComponent implements OnInit, AfterViewInit {
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
  DOTS_MODEL: { [key: string]: DotModelData } = {};

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

  get2DCoordinates(dotData: any) {
    if (!this.scene || !dotData.value.v2) {
      return {};
    }
    const bounds = this.scene.bounds;
    const key = dotData.key;
    const dot = dotData.value;
    const style: any = {};
    style['left'] = dot.v2.x * bounds.width + 'px';
    style['top'] = dot.v2.y * bounds.height + 'px';
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
    if (!this.scene) {
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
        this.DOTS_MODEL[this.selectedDot].v2 = { x, y };
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

  listenSelected3DPoint(data: any) {
    if (data == null) {
      this.selectedDot = null;
    } else {
      this.selectedDot = data.key;
      if (!(data.key in this.DOTS_MODEL)) {
        this.DOTS_MODEL[data.key] = { v3: { x: data.x, y: data.y, z: data.z } };
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
}
