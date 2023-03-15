import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CallgameRoutingModule } from './callgame-routing.module';
import { CallgameComponent } from './callgame.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';

@NgModule({
  declarations: [CallgameComponent],
  imports: [CommonModule, CallgameRoutingModule, MycommonModule],
})
export class CallgameModule {}
