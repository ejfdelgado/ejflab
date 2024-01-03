import { Directive, Input } from '@angular/core';

/*
Remember use is as follow:
[ngInit]="bindDragEventsThis"

1. Don't call the function!
2. Use this binding bindDragEventsThis = bindDragEvents.bind(this);
*/
@Directive({
  selector: '[ngInit]',
  exportAs: 'ngInit',
})
export class NgInit {
  @Input() values: any = {};

  @Input() ngInit: any;
  ngOnInit() {
    if (this.ngInit) {
      this.ngInit();
    }
  }
}
