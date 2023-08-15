import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DecisiontreeRoutingModule } from './decisiontree-routing.module';
import { DecisiontreeComponent } from './decisiontree.component';
import { MatIconModule } from '@angular/material/icon';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { FormsModule } from '@angular/forms';
import { WhenthenComponent } from './components/whenthen/whenthen.component';

@NgModule({
  declarations: [DecisiontreeComponent, WhenthenComponent],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    FormsModule,
    DecisiontreeRoutingModule,
  ],
})
export class DecisiontreeModule {}
