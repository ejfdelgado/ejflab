import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioeditorComponent } from './audioeditor/audioeditor.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [AudioeditorComponent],
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  exports: [AudioeditorComponent],
})
export class WavesurferModule {}
