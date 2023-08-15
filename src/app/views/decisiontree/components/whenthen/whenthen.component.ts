import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface WhenThenData {
  left: number;
  top: number;
  text: string;
}

export interface WhenThenHolderEventData {
  model: WhenThenData;
  event: MouseEvent;
}

@Component({
  selector: 'app-whenthen',
  templateUrl: './whenthen.component.html',
  styleUrls: ['./whenthen.component.css'],
})
export class WhenthenComponent implements OnInit {
  @Input() model: WhenThenData;
  @Output() holderMouseDown = new EventEmitter<WhenThenHolderEventData>();
  @Output() holderMouseUp = new EventEmitter<WhenThenHolderEventData>();
  constructor() {}

  holderMouseDownLocal(event: MouseEvent) {
    this.holderMouseDown.emit({ model: this.model, event });
  }

  holderMouseUpLocal(event: MouseEvent) {
    this.holderMouseUp.emit({ model: this.model, event });
  }

  ngOnInit(): void {}
}
