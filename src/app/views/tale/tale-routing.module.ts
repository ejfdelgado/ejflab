import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaleComponent } from './tale.component';

const routes: Routes = [{ path: '', component: TaleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaleRoutingModule { }
