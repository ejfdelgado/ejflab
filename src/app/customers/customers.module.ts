import { NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ActivatedRoute, Router } from '@angular/router';

@NgModule({
  declarations: [CustomersComponent],
  imports: [CommonModule, CustomersRoutingModule, MatToolbarModule],
})
export class CustomersModule {
  constructor() {}
}
