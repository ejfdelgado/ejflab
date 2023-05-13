import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByName',
})
export class SortByNamePipe implements PipeTransform {
  transform(value: any[]): any[] {
    if (value instanceof Array) {
      return value.sort((a, b) => {
        return ('' + a.value.name).localeCompare(b.value.name);
      });
    } else {
      return [];
    }
  }
}
