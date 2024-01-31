import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UechatRoutingModule } from './uechat-routing.module';
import { UechatComponent } from './uechat.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { ThreejsModule } from 'src/app/libs/threejs/threejs.module';
import { HumanposeModule } from '../humanpose/humanpose.module';

@NgModule({
  declarations: [UechatComponent],
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    UechatRoutingModule,
    MycommonModule,
    ThreejsModule,
    HumanposeModule,
  ],
})
export class UechatModule {}
