import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FileResponseData, FileService } from 'src/services/file.service';
import { WebcamService } from 'src/services/webcam.service';
import { IdGen } from 'srcJs/IdGen';

@Component({
  selector: 'app-fileordevicepopup',
  templateUrl: './fileordevicepopup.component.html',
  styleUrls: ['./fileordevicepopup.component.css'],
})
export class FileordevicepopupComponent implements OnInit {
  constructor(
    private fileSrv: FileService,
    private dialogRef: MatDialogRef<FileordevicepopupComponent>,
    private webcamSrv: WebcamService
  ) {}
  lastCallback: Function | null;
  ngOnInit(): void {}

  async usePhoto() {
    const respuesta = await this.webcamSrv.openWebcam({});
    if (!respuesta.canceled) {
      this.fileSrv.sendResponse({
        fileName: IdGen.nuevo(new Date().getTime()) + '.jpg',
        base64: respuesta.base64,
        canceled: false,
      });
      this.dialogRef.close();
    }
  }

  async processFile(responseData: FileResponseData) {
    if (this.lastCallback) {
      // podria ser const response = await
      this.lastCallback(responseData);
      // .close(response);
      this.dialogRef.close();
    }
  }

  useImageFile() {
    const processFileThis = this.processFile.bind(this);
    this.lastCallback = this.fileSrv.getLastCallback();
    this.fileSrv.sendRequest({ type: 'fileimage' }, processFileThis);
  }
}
