import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByName',
})
export class SortByNamePipe implements PipeTransform {
  transform(value: any[]): any[] {
    return value.sort((a, b) => {
      return ('' + a.value.name).localeCompare(b.value.name);
    });
  }
}
