import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface ElementItemData {
  url: string;
  name: string;
  date?: number;
  checked?: boolean;
}

@Component({
  selector: 'app-scrollfiles',
  templateUrl: './scrollfiles.component.html',
  styleUrls: ['./scrollfiles.component.css'],
})
export class ScrollfilesComponent implements OnInit {
  @Input()
  archivos: Array<ElementItemData> = [];
  @Output('uploadFile')
  uploadFile: EventEmitter<any> = new EventEmitter();
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementItemData> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  noneFun(): void {}

  toggleCheck(ele: ElementItemData): void {
    if (ele.checked === true) {
      ele.checked = false;
    } else {
      ele.checked = true;
    }
  }

  downloadFIle(ele: ElementItemData): void {
    // Download file
    console.log('TODO download');
  }
}
