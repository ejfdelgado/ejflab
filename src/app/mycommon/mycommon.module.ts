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
import { BlobeditorComponent } from './components/blobeditor/blobeditor.component';
import { FileordevicepopupComponent } from './components/fileordevicepopup/fileordevicepopup.component';
import { FilepickerComponent } from './components/filepicker/filepicker.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CanvaseditorComponent } from './components/canvaseditor/canvaseditor.component';
import { MatSliderModule } from '@angular/material/slider';
import { ScrollnavComponent } from './components/scrollnav/scrollnav.component';
import { ScrollfilesComponent } from './components/scrollfiles/scrollfiles.component';
import { PrejsonComponent } from './components/prejson/prejson.component';
import { ScrollfileComponent } from './components/scrollfile/scrollfile.component';
import { SortByNamePipe } from './pipes/sort-by-name.pipe';
import { NgInit } from './directives/NgInit';
import { JsonColorPipe } from './pipes/json-color.pipe';
import { Json2svg } from './pipes/json2svg.pipe';

@NgModule({
  declarations: [
    CardComponent,
    ImagepickerComponent,
    StatusbarComponent,
    StreamingComponent,
    FechaCardPipe,
    TxtfileeditorComponent,
    BlobeditorComponent,
    FileordevicepopupComponent,
    FilepickerComponent,
    CanvaseditorComponent,
    ScrollnavComponent,
    ScrollfilesComponent,
    PrejsonComponent,
    ScrollfileComponent,
    SortByNamePipe,
    JsonColorPipe,
    Json2svg,
    NgInit,
  ],
  imports: [
    FontAwesomeModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    FormsModule,
    ReactiveFormsModule,
    ContenteditableValueAccessorModule,
    MatProgressBarModule,
    MatSliderModule,
  ],
  exports: [
    CardComponent,
    ImagepickerComponent,
    StatusbarComponent,
    StreamingComponent,
    TxtfileeditorComponent,
    BlobeditorComponent,
    FilepickerComponent,
    FileordevicepopupComponent,
    CanvaseditorComponent,
    ScrollnavComponent,
    ScrollfilesComponent,
    PrejsonComponent,
    SortByNamePipe,
    JsonColorPipe,
    Json2svg,
    NgInit,
  ],
})
export class MycommonModule {}
