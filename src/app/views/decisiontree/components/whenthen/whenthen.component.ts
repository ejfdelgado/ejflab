import {
  AfterViewInit,
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
export class WhenthenComponent implements OnInit, AfterViewInit {
  @ViewChild('boundingbox') boundingbox: ElementRef;
  @Input() model: WhenThenData;
  @Output() holderMouseDown = new EventEmitter<WhenThenHolderEventData>();
  @Output() holderMouseUp = new EventEmitter<MouseEvent>();
  @Output() deleteNode = new EventEmitter<WhenThenData>();
  @Output() createArrow = new EventEmitter<WhenThenData>();
  constructor() {}

  preventPropagate(event: MouseEvent) {
    event.stopPropagation();
  }

  createArrowEvent(event: MouseEvent) {
    event.stopPropagation();
    this.createArrow.emit(this.model);
  }

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

  deleteNodeLocal() {
    this.deleteNode.emit(this.model);
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.model.width = this.boundingbox.nativeElement.clientWidth;
    this.model.height = this.boundingbox.nativeElement.clientHeight;
  }
}
