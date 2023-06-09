import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CvRoutingModule } from './cv-routing.module';
import { CvComponent } from './cv.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { WavesurferModule } from 'src/app/libs/wavesurfer/wavesurfer.module';

@NgModule({
  declarations: [CvComponent],
  imports: [CommonModule, CvRoutingModule, MycommonModule, WavesurferModule],
})
export class CvModule {}
