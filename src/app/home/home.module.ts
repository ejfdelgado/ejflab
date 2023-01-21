import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MycommonModule } from '../mycommon/mycommon.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, HomeRoutingModule, FontAwesomeModule, MycommonModule],
})
export class HomeModule {}
