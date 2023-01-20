import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  text: string;
  title: string;
  faXmark = faXmark;
  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.text = typeof data.txt == "string" ? data.txt : "Sin detalle";
    this.title = typeof data.title == "string" ? data.title : "Información";
  }

  ngOnInit(): void {
  }

  aceptar() {
    this.dialogRef.close(true);
  }
}
