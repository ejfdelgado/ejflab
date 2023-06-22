import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreejsProjectionComponent } from './threejs-projection/threejs-projection.component';
import { ThreejsComponent } from './threejs/threejs.component';
import { ThreejsCameraComponent } from './threejs-camera/threejs-camera.component';

@NgModule({
  declarations: [
    ThreejsProjectionComponent,
    ThreejsComponent,
    ThreejsCameraComponent,
  ],
  imports: [CommonModule],
  exports: [
    ThreejsProjectionComponent,
    ThreejsComponent,
    ThreejsCameraComponent,
  ],
})
export class ThreejsModule {}
