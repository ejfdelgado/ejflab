import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaleRoutingModule } from './tale-routing.module';
import { TaleComponent } from './tale.component';
import { MycommonModule } from '../mycommon/mycommon.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TaleComponent],
  imports: [
    CommonModule,
    TaleRoutingModule,
    MycommonModule,
    MatMenuModule,
    MatIconModule,
  ],
})
export class TaleModule {}
