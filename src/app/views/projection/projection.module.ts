import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectionRoutingModule } from './projection-routing.module';
import { ProjectionComponent } from './projection.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';


@NgModule({
  declarations: [
    ProjectionComponent
  ],
  imports: [
    CommonModule,
    MycommonModule,
    ProjectionRoutingModule
  ]
})
export class ProjectionModule { }
