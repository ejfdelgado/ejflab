import { Pipe, PipeTransform } from '@angular/core';
import { MyDatesFront } from 'srcJs/MyDatesFront';

@Pipe({
  name: 'fechaCard',
})
export class FechaCardPipe implements PipeTransform {
  transform(value: number | undefined, ...args: unknown[]): unknown {
    if (typeof value == 'number') {
      return MyDatesFront.formatDateCompleto(new Date(value * 1000), args);
    }
    return null;
  }
}
