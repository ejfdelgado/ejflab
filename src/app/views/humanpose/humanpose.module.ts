import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HumanposeRoutingModule } from './humanpose-routing.module';
import { HumanposeComponent } from './humanpose.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [HumanposeComponent],
  imports: [
    CommonModule,
    MycommonModule,
    //FormsModule,
    //ReactiveFormsModule,
    HumanposeRoutingModule,
    //BrowserModule,
    //MatInputModule,
  ],
})
export class HumanposeModule {}
