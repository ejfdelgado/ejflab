import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImagepickerComponent } from './components/imagepicker/imagepicker.component';
import { StatusbarComponent } from './components/statusbar/statusbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { StreamingComponent } from './components/streaming/streaming.component';
import { FechaCardPipe } from './pipes/fecha-card.pipe';
import { TxtfileeditorComponent } from './components/txtfileeditor/txtfileeditor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContenteditableValueAccessorModule } from '@tinkoff/angular-contenteditable-accessor';

@NgModule({
  declarations: [
    CardComponent,
    ImagepickerComponent,
    StatusbarComponent,
    StreamingComponent,
    FechaCardPipe,
    TxtfileeditorComponent,
  ],
  imports: [
    FontAwesomeModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorModule,
  ],
  exports: [
    CardComponent,
    ImagepickerComponent,
    StatusbarComponent,
    StreamingComponent,
    TxtfileeditorComponent,
  ],
})
export class MycommonModule {}
