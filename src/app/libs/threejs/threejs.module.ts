import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreejsProjectionComponent } from './threejs-projection/threejs-projection.component';
import { ThreejsComponent } from './threejs/threejs.component';

@NgModule({
  declarations: [ThreejsProjectionComponent, ThreejsComponent],
  imports: [CommonModule],
  exports: [ThreejsProjectionComponent, ThreejsComponent],
})
export class ThreejsModule {}
