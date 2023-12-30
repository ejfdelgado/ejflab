import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export interface GenericChoiceData {
  txt: string;
  val: string;
}

export interface GenericData {
  txt?: string;
  title?: string;
  timeout?: number;
  choices?: Array<GenericChoiceData>;
  callback?: string;
}

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.css'],
})
export class GenericComponent implements OnInit {
  text: string = 'Sin detalle';
  title: string = 'Pop Up';
  timeout: number = 0; // means no timeout
  choices: Array<GenericChoiceData> = [];
  callback: string = '';
  faXmark = faXmark;
  constructor(
    public dialogRef: MatDialogRef<GenericComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericData
  ) {
    if (typeof data.txt == 'string') {
      this.text = data.txt;
    }
    if (typeof data.title == 'string') {
      this.title = data.title;
    }
    if (typeof data.timeout == 'number') {
      this.timeout = data.timeout;
    }
    if (data.choices instanceof Array) {
      this.choices = data.choices;
    }
    if (typeof data.callback == 'string') {
      this.callback = data.callback;
    }
  }

  ngOnInit(): void {}

  selectChoice(choice: string) {
    this.dialogRef.close({
      callback: this.callback,
      choice,
    });
  }
}
