import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectionRoutingModule } from './projection-routing.module';
import { ProjectionComponent } from './projection.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { MatIconModule } from '@angular/material/icon';
import { MenuControlComponent } from './components/menu-control/menu-control.component';

@NgModule({
  declarations: [ProjectionComponent, MenuControlComponent],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    ProjectionRoutingModule,
  ],
})
export class ProjectionModule {}
