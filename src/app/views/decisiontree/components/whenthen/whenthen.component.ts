import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

export interface WhenThenData {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
}

export interface WhenThenHolderEventData {
  model: WhenThenData;
  event: MouseEvent;
  element: ElementRef;
}

@Component({
  selector: 'app-whenthen',
  templateUrl: './whenthen.component.html',
  styleUrls: ['./whenthen.component.css'],
})
export class WhenthenComponent implements OnInit {
  @ViewChild('boundingbox') boundingbox: ElementRef;
  @Input() model: WhenThenData;
  @Output() holderMouseDown = new EventEmitter<WhenThenHolderEventData>();
  @Output() holderMouseUp = new EventEmitter<MouseEvent>();
  constructor() {}

  holderMouseDownLocal(event: MouseEvent) {
    this.holderMouseDown.emit({
      model: this.model,
      event,
      element: this.boundingbox,
    });
  }

  holderMouseUpLocal(event: MouseEvent) {
    this.holderMouseUp.emit(event);
  }

  ngOnInit(): void {}
}
