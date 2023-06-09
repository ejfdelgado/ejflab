import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectionRoutingModule } from './projection-routing.module';
import { ProjectionComponent } from './projection.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { MatIconModule } from '@angular/material/icon';
import { MenuControlComponent } from './components/menu-control/menu-control.component';
import { FormsModule } from '@angular/forms';
import { SortByNamePipe } from 'src/app/mycommon/pipes/sort-by-name.pipe';
import { VideoCanvasComponent } from './components/video-canvas/video-canvas.component';
import { ThreejsProjectionComponent } from './components/threejs-projection/threejs-projection.component';

@NgModule({
  declarations: [
    ProjectionComponent,
    MenuControlComponent,
    VideoCanvasComponent,
    ThreejsProjectionComponent,
  ],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    ProjectionRoutingModule,
    FormsModule,
  ],
})
export class ProjectionModule {}
