import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DecisiontreeComponent } from './decisiontree.component';

const routes: Routes = [{ path: '', component: DecisiontreeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DecisiontreeRoutingModule { }
