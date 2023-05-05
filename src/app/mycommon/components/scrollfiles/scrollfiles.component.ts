import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ElementItemData } from '../scrollfile/scrollfile.component';

@Component({
  selector: 'app-scrollfiles',
  templateUrl: './scrollfiles.component.html',
  styleUrls: ['./scrollfiles.component.css'],
})
export class ScrollfilesComponent implements OnInit {
  @Input()
  archivos: Array<ElementItemData> = [];
  @Output('uploadFile')
  uploadFile: EventEmitter<void> = new EventEmitter();
  @Output('deleteFile')
  deleteFile: EventEmitter<ElementItemData> = new EventEmitter();
  @Output('openFile')
  openFile: EventEmitter<ElementItemData> = new EventEmitter();
  @Output('saveAll')
  saveAll: EventEmitter<void> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  noneFun(): void {}

  onBlurContentEditable() {
    this.sortByName();
  }
  sortByName() {
    return this.archivos.sort((a, b) => {
      return ('' + a.name).localeCompare(b.name);
    });
  }
}
