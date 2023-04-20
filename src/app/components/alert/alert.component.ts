import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { HttpService } from 'src/services/http.service';
import { MyTemplate } from 'srcJs/MyTemplate';

export interface AlertDataButton {
  color?: string;
  label?: string;
  action?: Function;
}

export interface AlertData {
  title?: string;
  txt?: string;
  isUrl?: boolean;
  ishtml?: boolean;
  buttons?: Array<AlertDataButton>;
  payload?: any;
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  text: string;
  title: string;
  buttons?: Array<AlertDataButton>;
  faXmark = faXmark;
  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
    private readonly httpSrv: HttpService,
    @Inject(MAT_DIALOG_DATA) public data: AlertData
  ) {
    this.title = typeof data.title == 'string' ? data.title : 'Información';
    this.buttons = data.buttons;
    if (!this.buttons) {
      this.buttons = [];
      /*
      this.buttons = [
        {
          color: 'primary',
          label: 'Aceptar',
          action: this.aceptar.bind(this),
        },
      ];
      */
    }
    this.loadTemplate();
  }

  ngOnInit(): void {}

  async loadTemplate() {
    if (typeof this.data.txt == 'string') {
      if (this.data.isUrl) {
        const temp = await this.httpSrv.get<string>(this.data.txt, {
          showIndicator: true,
          rawString: true,
          useCache: true,
        });
        if (temp != null) {
          this.text = temp;
        } else {
          this.text = this.data.txt;
        }
      } else {
        this.text = this.data.txt;
      }
      if (typeof this.data.payload == 'object' && this.data.payload !== null) {
        const renderer = new MyTemplate();
        this.text = renderer.render(this.text, this.data.payload);
      }
    } else {
      this.text = 'Sin detalle';
    }
  }

  async genericAction(detail: AlertDataButton) {
    if (typeof detail.action == 'function') {
      const response = detail.action(this.data);
      if (response instanceof Promise) {
        const datoRespondido = await response;
      }
      this.dialogRef.close(true);
    }
  }

  async aceptar(data: AlertData) {}
}
