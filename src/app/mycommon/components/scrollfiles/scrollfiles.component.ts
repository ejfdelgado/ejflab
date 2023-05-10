import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  ElementItemData,
  ElementPairItemData,
} from '../scrollfile/scrollfile.component';

export interface ScrollFilesActionData {
  callback: Function;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-scrollfiles',
  templateUrl: './scrollfiles.component.html',
  styleUrls: ['./scrollfiles.component.css'],
})
export class ScrollfilesComponent implements OnInit {
  @Input()
  archivos: { [key: string]: ElementItemData };
  @Input()
  actions: Array<ScrollFilesActionData>;
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementPairItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementPairItemData> = new EventEmitter();

  constructor(public cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  noneFun(): void {}

  onBlurContentEditable() {
    const temp = this.archivos;
    this.archivos = {};
    setTimeout(() => {
      this.archivos = temp;
    }, 0);
  }
}
