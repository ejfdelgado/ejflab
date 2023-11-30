import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UechatRoutingModule } from './uechat-routing.module';
import { UechatComponent } from './uechat.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UechatComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UechatRoutingModule
  ]
})
export class UechatModule { }
