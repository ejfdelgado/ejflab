import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ImagepickerComponent } from './components/imagepicker/imagepicker.component';

@NgModule({
  declarations: [CardComponent, ImagepickerComponent],
  imports: [FontAwesomeModule, CommonModule],
  exports: [CardComponent, ImagepickerComponent],
})
export class MycommonModule {}
