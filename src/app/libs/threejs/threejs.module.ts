import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreejsProjectionComponent } from './threejs-projection/threejs-projection.component';
import { ThreejsComponent } from './threejs/threejs.component';
import { ThreejsCameraComponent } from './threejs-camera/threejs-camera.component';
import { ThreejsGalleryComponent } from './threejs-gallery/threejs-gallery.component';
import { ThreejsVrComponent } from './threejs-vr/threejs-vr.component';

@NgModule({
  declarations: [
    ThreejsProjectionComponent,
    ThreejsComponent,
    ThreejsCameraComponent,
    ThreejsGalleryComponent,
    ThreejsVrComponent,
  ],
  imports: [CommonModule],
  exports: [
    ThreejsProjectionComponent,
    ThreejsComponent,
    ThreejsCameraComponent,
    ThreejsGalleryComponent,
    ThreejsVrComponent,
  ],
})
export class ThreejsModule {}
