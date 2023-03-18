import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaleRoutingModule } from './tale-routing.module';
import { TaleComponent } from './tale.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContenteditableValueAccessorModule } from '@tinkoff/angular-contenteditable-accessor';

@NgModule({
  declarations: [TaleComponent],
  imports: [
    CommonModule,
    TaleRoutingModule,
    MycommonModule,
    MatMenuModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorModule
  ],
})
export class TaleModule {}
