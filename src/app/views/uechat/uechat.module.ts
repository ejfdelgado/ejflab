import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UechatRoutingModule } from './uechat-routing.module';
import { UechatComponent } from './uechat.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';

@NgModule({
  declarations: [UechatComponent],
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule,
    UechatRoutingModule,
    MycommonModule,
  ],
})
export class UechatModule {}
