import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [CardComponent],
  imports: [FontAwesomeModule, CommonModule],
  exports: [CardComponent],
})
export class MycommonModule {}
