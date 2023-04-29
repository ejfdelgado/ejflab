import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HumanposeRoutingModule } from './humanpose-routing.module';
import { HumanposeComponent } from './humanpose.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';

@NgModule({
  declarations: [HumanposeComponent],
  imports: [CommonModule, MycommonModule, HumanposeRoutingModule],
})
export class HumanposeModule {}
