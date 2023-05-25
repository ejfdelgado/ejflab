import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectionRoutingModule } from './projection-routing.module';
import { ProjectionComponent } from './projection.component';


@NgModule({
  declarations: [
    ProjectionComponent
  ],
  imports: [
    CommonModule,
    ProjectionRoutingModule
  ]
})
export class ProjectionModule { }
