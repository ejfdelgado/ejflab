import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewContainerRef,
} from '@angular/core';

export interface ElementItemData {
  url: string;
  name: string;
  date?: number;
  checked?: boolean;
}

export interface ElementPairItemData {
  key: string;
  value: ElementItemData;
}

@Component({
  selector: 'app-scrollfile',
  templateUrl: './scrollfile.component.html',
  styleUrls: ['./scrollfile.component.css'],
})
export class ScrollfileComponent implements OnInit {
  @Input('elemento')
  elemento: ElementPairItemData;
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementPairItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementPairItemData> = new EventEmitter();
  @Output('onBlur')
  onBlur: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  toggleCheck(ele: ElementPairItemData): void {
    if (ele.value.checked === true) {
      ele.value.checked = false;
    } else {
      ele.value.checked = true;
    }
  }

  downloadFile(ele: ElementPairItemData): void {
    // Download file
    console.log('TODO download');
  }
}
