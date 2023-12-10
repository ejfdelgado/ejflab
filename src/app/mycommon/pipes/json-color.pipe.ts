import { Pipe, PipeTransform } from '@angular/core';
import sortify from 'srcJs/sortify';

@Pipe({
  name: 'jsonColor',
})
export class JsonColorPipe implements PipeTransform {
  replacer(match: any, pIndent: any, pKey: any, pVal: any, pEnd: any): any {
    var key = '<span class=json-key>';
    var val = '<span class=json-value>';
    var str = '<span class=json-string>';
    var r = pIndent || '';
    if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
    if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
    return r + (pEnd || '');
  }

  transform(value: any): any {
    var jsonLine = /^(\s*)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm;
    return sortify(value, 3)
      .replace(/&/g, '&amp;')
      .replace(/\\"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(jsonLine, this.replacer);
  }
}
