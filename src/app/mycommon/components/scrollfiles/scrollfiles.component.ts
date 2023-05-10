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

@Component({
  selector: 'app-scrollfiles',
  templateUrl: './scrollfiles.component.html',
  styleUrls: ['./scrollfiles.component.css'],
})
export class ScrollfilesComponent implements OnInit {
  @Input()
  archivos: { [key: string]: ElementItemData };
  @Output('uploadFile')
  uploadFile: EventEmitter<void> = new EventEmitter();
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementPairItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementPairItemData> = new EventEmitter();
  @Output('saveAll')
  saveAll: EventEmitter<void> = new EventEmitter();

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
