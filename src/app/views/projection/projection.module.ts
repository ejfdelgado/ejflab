import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectionRoutingModule } from './projection-routing.module';
import { ProjectionComponent } from './projection.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { MatIconModule } from '@angular/material/icon';
import { MenuControlComponent } from './components/menu-control/menu-control.component';
import { FormsModule } from '@angular/forms';
import { VideoCanvasComponent } from './components/video-canvas/video-canvas.component';
import { ThreejsModule } from 'src/app/libs/threejs/threejs.module';
import { LicenseComponent } from './components/license/license.component';

@NgModule({
  declarations: [
    ProjectionComponent,
    MenuControlComponent,
    VideoCanvasComponent,
    LicenseComponent,
  ],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    ProjectionRoutingModule,
    FormsModule,
    ThreejsModule,
  ],
})
export class ProjectionModule {}
