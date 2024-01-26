import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicScene } from './BasicScene';

@Component({
  selector: 'app-threejs-vr',
  templateUrl: './threejs-vr.component.html',
  styleUrls: ['./threejs-vr.component.css'],
})
export class ThreejsVrComponent implements OnInit, AfterViewInit {
  @ViewChild('mycanvas') canvasRef: ElementRef;
  @ViewChild('myparent') prentRef: ElementRef;
  scene: BasicScene | null = null;
  bounds: DOMRect | null = null;

  constructor() {}

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
    this.loop();
  }

  loop() {
    if (this.scene != null && this.scene.camera) {
      this.scene.camera?.updateProjectionMatrix();
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

  async keyBoardEvent(id: string, keyAction: string) {
    const ROTATION_SPEED = 4;
    const POSITION_SPEED = 0.1;
    if (keyAction == 'ArrowUp') {
      //Go forward
      const rotation = await this.getEntityValue(id, 'rotation');
      const position = await this.getEntityValue(id, 'position');
      // compute vector front
      const dx = Math.cos(rotation._y);
      const dz = Math.sin(rotation._y);
      position.x = position.x - dx * POSITION_SPEED;
      position.z = position.z + dz * POSITION_SPEED;
      await this.setEntityValue(id, 'position', position);
    } else if (keyAction == 'ArrowRight') {
      // Turn right
      const rotation = await this.getEntityValue(id, 'rotation');
      //console.log(`rotation = ${JSON.stringify(rotation)}`);
      const actualY = rotation._y;
      rotation.y = actualY - (ROTATION_SPEED * Math.PI) / 180;
      await this.setEntityValue(id, 'rotation', rotation);
    } else if (keyAction == 'ArrowLeft') {
      //Turn left
      const rotation = await this.getEntityValue(id, 'rotation');
      //console.log(`rotation = ${JSON.stringify(rotation)}`);
      const actualY = rotation._y;
      rotation.y = actualY + (ROTATION_SPEED * Math.PI) / 180;
      await this.setEntityValue(id, 'rotation', rotation);
    } else if (keyAction == 'ArrowDown') {
      //Go backwards
      const rotation = await this.getEntityValue(id, 'rotation');
      const position = await this.getEntityValue(id, 'position');
      // compute vector front
      const dx = Math.cos(rotation._y);
      const dz = Math.sin(rotation._y);
      position.x = position.x + dx * POSITION_SPEED;
      position.z = position.z - dz * POSITION_SPEED;
      await this.setEntityValue(id, 'position', position);
    }
  }
}
