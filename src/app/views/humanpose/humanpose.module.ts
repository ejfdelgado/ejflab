import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HumanposeRoutingModule } from './humanpose-routing.module';
import { HumanposeComponent } from './humanpose.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ThreejsModule } from 'src/app/libs/threejs/threejs.module';
import { TensorflowModule } from 'src/app/libs/tensorflow/tensorflow.module';

@NgModule({
  declarations: [HumanposeComponent],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    FormsModule,
    HumanposeRoutingModule,
    MatInputModule,
    ThreejsModule,
    TensorflowModule,
  ],
})
export class HumanposeModule {}
