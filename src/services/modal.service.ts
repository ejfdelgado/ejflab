import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AlertComponent,
  AlertData,
} from 'src/app/components/alert/alert.component';
import {
  ConfirmComponent,
  ConfirmData,
} from 'src/app/components/confirm/confirm.component';
import {
  GenericComponent,
  GenericData,
} from 'src/app/components/generic/generic.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor(public dialog: MatDialog) {}

  async alert(payload: AlertData) {
    const dialogRef = this.dialog.open(AlertComponent, { data: payload });
    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }

  async error(error: Error) {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: { title: 'Ups!', txt: error.message },
    });
    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }

  async confirm(payload: ConfirmData) {
    const dialogRef = this.dialog.open(ConfirmComponent, { data: payload });
    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }

  async generic(payload: GenericData) {
    const dialogRef = this.dialog.open(GenericComponent, {
      data: payload,
      disableClose: true, //Force pick a choice
    });
    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
  }
  genericComplete(payload: GenericData) {
    const dialogRef = this.dialog.open(GenericComponent, {
      data: payload,
      disableClose: true, //Force pick a choice
    });
    return {
      ref: dialogRef,
      promise: new Promise((resolve) => {
        dialogRef.afterClosed().subscribe((result) => {
          resolve(result);
        });
      }),
    };
  }
}
