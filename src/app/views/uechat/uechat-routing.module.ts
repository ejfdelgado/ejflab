import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UechatComponent } from './uechat.component';

const routes: Routes = [{ path: '', component: UechatComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UechatRoutingModule { }
