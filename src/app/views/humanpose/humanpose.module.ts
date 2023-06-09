import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HumanposeRoutingModule } from './humanpose-routing.module';
import { HumanposeComponent } from './humanpose.component';
import { MycommonModule } from 'src/app/mycommon/mycommon.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ThreejsComponent } from './components/threejs/threejs.component';
import { TensorflowtrainComponent } from './components/tensorflowtrain/tensorflowtrain.component';
import { TensorflowComponent } from './components/tensorflow/tensorflow.component';

@NgModule({
  declarations: [
    HumanposeComponent,
    ThreejsComponent,
    TensorflowtrainComponent,
    TensorflowComponent,
  ],
  imports: [
    MatIconModule,
    CommonModule,
    MycommonModule,
    FormsModule,
    HumanposeRoutingModule,
    MatInputModule,
  ],
})
export class HumanposeModule {}
