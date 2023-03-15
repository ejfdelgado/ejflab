import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallgameComponent } from './callgame.component';

const routes: Routes = [{ path: '', component: CallgameComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallgameRoutingModule { }
