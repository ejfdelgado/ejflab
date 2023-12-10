import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'json2svg',
})
export class Json2svg implements PipeTransform {
  transform(value: any): string {
    let respuesta = '';
    return respuesta;
  }
}
