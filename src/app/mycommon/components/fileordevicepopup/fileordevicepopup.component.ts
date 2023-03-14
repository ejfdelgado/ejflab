import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FileRequestData,
  FileResponseData,
  FileService,
} from 'src/services/file.service';
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
    private webcamSrv: WebcamService,
    @Inject(MAT_DIALOG_DATA) public data: FileRequestData
  ) {}
  lastCallback: Function | null;
  ngOnInit(): void {}

  async usePhoto() {
    const respuesta = await this.webcamSrv.openWebcam({});
    if (!respuesta.canceled) {
      let fileName = this.data.defaultFileName;
      if (!fileName) {
        fileName = IdGen.nuevo(new Date().getTime()) + '.jpg';
      }
      this.fileSrv.sendResponse({
        fileName: fileName,
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
    const options: FileRequestData = {
      type: 'fileimage',
      defaultFileName: this.data.defaultFileName,
    };
    this.fileSrv.sendRequest(options, processFileThis);
  }
}
