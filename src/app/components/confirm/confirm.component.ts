import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export interface ConfirmData {
  txt?: string;
  title?: string;
}

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
})
export class ConfirmComponent implements OnInit {
  text: string;
  title: string;
  faXmark = faXmark;
  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmData
  ) {
    this.text = typeof data.txt == 'string' ? data.txt : 'Sin detalle';
    this.title = typeof data.title == 'string' ? data.title : 'Confirmación';
  }

  ngOnInit(): void {}

  cancelar() {
    this.dialogRef.close(false);
  }

  aceptar() {
    this.dialogRef.close(true);
  }
}
