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

@Component({
  selector: 'app-scrollfile',
  templateUrl: './scrollfile.component.html',
  styleUrls: ['./scrollfile.component.css'],
})
export class ScrollfileComponent implements OnInit {
  @Input('elemento')
  elemento: ElementItemData;
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementItemData> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  toggleCheck(ele: ElementItemData): void {
    if (ele.checked === true) {
      ele.checked = false;
    } else {
      ele.checked = true;
    }
  }

  downloadFile(ele: ElementItemData): void {
    // Download file
    console.log('TODO download');
  }
}
