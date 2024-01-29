import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { BasicScene } from './BasicScene';

export interface EntityValueHolder {
  getEntityValue(id: string, key: string): Promise<any>;
  setEntityValue(id: string, key: string, value: any): Promise<void>;
}

export class LowPressure {
  lastTime: number = 0;
  delta: number;
  emmiter: EventEmitter<any>;
  constructor(delta: number, emmiter: EventEmitter<any>) {
    this.delta = delta;
    this.emmiter = emmiter;
  }
  emit(some: any) {
    const ahora = new Date().getTime();
    if (ahora - this.lastTime > this.delta) {
      this.lastTime = ahora;
      this.emmiter.emit(some);
    }
  }
}

@Component({
  selector: 'app-threejs-vr',
  templateUrl: './threejs-vr.component.html',
  styleUrls: ['./threejs-vr.component.css'],
})
export class ThreejsVrComponent
  implements OnInit, AfterViewInit, EntityValueHolder
{
  @ViewChild('mycanvas') canvasRef: ElementRef;
  @ViewChild('myparent') prentRef: ElementRef;
  scene: BasicScene | null = null;
  bounds: DOMRect | null = null;
  @Output()
  vrPosition: EventEmitter<THREE.Vector3> = new EventEmitter();
  vrPositionLowPressure: LowPressure;

  constructor(private renderer: Renderer2) {
    this.vrPositionLowPressure = new LowPressure(1000, this.vrPosition);
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event: any) {
    this.computeDimensions();
    if (this.scene != null && this.bounds != null) {
      this.scene.setBounds(this.bounds);
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
    const vrButton = this.scene.vrButton;
    if (vrButton != null) {
      this.renderer.appendChild(this.prentRef.nativeElement, vrButton);
    }
    this.loop();
  }

  loop() {
    if (this.scene != null && this.scene.camera) {
      const scene: BasicScene = this.scene;
      const camera: THREE.PerspectiveCamera = this.scene.camera;
      // This is used for non VR
      /*
      this.scene.camera?.updateProjectionMatrix();
      this.scene.renderer?.render(this.scene, this.scene.camera);
      this.scene.orbitals?.update();
      requestAnimationFrame(() => {
        this.loop();
      });
      */

      // This is used for VR
      if (scene.renderer) {
        const renderer: THREE.WebGLRenderer = scene.renderer;
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
          const position = new THREE.Vector3();
          position.setFromMatrixPosition(camera.matrixWorld);
          this.vrPositionLowPressure.emit(position);
        });
      }
    }
  }

  public computeDimensions() {
    const scrollEl = this.prentRef.nativeElement;
    this.bounds = scrollEl.getBoundingClientRect();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.onResize({});
    }, 0);
  }

  async getEntityValue(id: string, key: string): Promise<any> {
    if (this.scene) {
      return await this.scene.getEntityValue(id, key);
    } else {
      return null;
    }
  }

  async setEntityValue(id: string, key: string, value: any) {
    if (this.scene) {
      await this.scene.setEntityValue(id, key, value);
    }
  }

  async keyBoardEvent(
    id: string,
    keyAction: string,
    entityHolder: EntityValueHolder
  ) {
    const ROTATION_SPEED = 4;
    const POSITION_SPEED = 0.1;
    if (keyAction == 'ArrowUp') {
      //Go forward
      const rotation = await entityHolder.getEntityValue(id, 'rotation');
      const position = await entityHolder.getEntityValue(id, 'position');
      // compute vector front
      const dx = Math.cos(rotation._y);
      const dz = Math.sin(rotation._y);
      position.x = position.x - dx * POSITION_SPEED;
      position.z = position.z + dz * POSITION_SPEED;
      //this.vrPositionLowPressure.emit(position);
      await entityHolder.setEntityValue(id, 'position', position);
    } else if (keyAction == 'ArrowRight') {
      // Turn right
      const rotation = await entityHolder.getEntityValue(id, 'rotation');
      //console.log(`rotation = ${JSON.stringify(rotation)}`);
      const actualY = rotation._y;
      rotation.y = actualY - (ROTATION_SPEED * Math.PI) / 180;
      rotation._y = rotation.y;
      await entityHolder.setEntityValue(id, 'rotation', rotation);
    } else if (keyAction == 'ArrowLeft') {
      //Turn left
      const rotation = await entityHolder.getEntityValue(id, 'rotation');
      //console.log(`rotation = ${JSON.stringify(rotation)}`);
      const actualY = rotation._y;
      rotation.y = actualY + (ROTATION_SPEED * Math.PI) / 180;
      rotation._y = rotation.y;
      await entityHolder.setEntityValue(id, 'rotation', rotation);
    } else if (keyAction == 'ArrowDown') {
      //Go backwards
      const rotation = await entityHolder.getEntityValue(id, 'rotation');
      const position = await entityHolder.getEntityValue(id, 'position');
      // compute vector front
      const dx = Math.cos(rotation._y);
      const dz = Math.sin(rotation._y);
      position.x = position.x + dx * POSITION_SPEED;
      position.z = position.z - dz * POSITION_SPEED;
      //this.vrPositionLowPressure.emit(position);
      await entityHolder.setEntityValue(id, 'position', position);
    }
  }
}
