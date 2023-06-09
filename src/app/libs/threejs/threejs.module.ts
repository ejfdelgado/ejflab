import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreejsProjectionComponent } from './threejs-projection/threejs-projection.component';

@NgModule({
  declarations: [ThreejsProjectionComponent],
  imports: [CommonModule],
  exports: [ThreejsProjectionComponent],
})
export class ThreejsModule {}
