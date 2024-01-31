import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileService } from 'src/services/file.service';
import { WebcamService } from 'src/services/webcam.service';
import { FileordevicepopupComponent } from '../fileordevicepopup/fileordevicepopup.component';
import { IdGen } from 'srcJs/IdGen';
import { FileRequestData } from 'src/services/fileInterface';

@Component({
  selector: 'app-filepicker',
  templateUrl: './filepicker.component.html',
  styleUrls: ['./filepicker.component.css'],
})
export class FilepickerComponent implements OnInit {
  @ViewChild('imageInput') imageInput: ElementRef;
  imageInputBinded = false;
  lastDefaultFileName?: string | null = null;
  constructor(
    private fileSrv: FileService,
    private dialog: MatDialog,
    private webcamSrv: WebcamService
  ) {}

  ngOnInit(): void {
    const openFileRequestThis = this.openFileRequest.bind(this);
    this.fileSrv.subscribe(openFileRequestThis);
  }

  private async openFileRequest(payload: FileRequestData) {
    // file, fileimage, photo, fileimage-photo
    this.lastDefaultFileName = payload.defaultFileName;
    const nativeElement = this.imageInput.nativeElement;
    nativeElement.value = '';
    if (payload.type == 'file') {
      // Open file picker image
      nativeElement.accept = '';
      if (typeof payload.mimeType == 'string') {
        nativeElement.accept = payload.mimeType;
      }
      nativeElement.click();
    } else if (payload.type == 'fileimage') {
      // Open file picker general file
      nativeElement.accept = 'image/*';
      nativeElement.click();
    } else if (payload.type == 'fileaudio') {
      // Open file picker general file
      nativeElement.accept = 'audio/*';
      nativeElement.click();
    } else if (payload.type == 'fileimage-photo') {
      // Open modal (photo/file)
      this.dialog.open(FileordevicepopupComponent, {
        data: {
          type: 'image',
          defaultFileName: payload.defaultFileName,
        },
      });
    } else if (payload.type == 'photo') {
      // Open photo
      const respuesta = await this.webcamSrv.openWebcam({});
      if (!respuesta.canceled) {
        let fileName = payload.defaultFileName;
        if (!fileName) {
          fileName = IdGen.nuevo(new Date().getTime()) + '.jpg';
        }
        this.fileSrv.sendResponse({
          fileName: fileName,
          base64: respuesta.base64,
          canceled: false,
        });
      }
    }
  }

  processFile(textInput: any) {
    const file: File = textInput.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', async (event: any) => {
      const base64 = event.target.result;
      this.fileSrv.sendResponse({
        canceled: false,
        base64: base64,
        fileName: this.lastDefaultFileName
          ? this.lastDefaultFileName
          : file.name,
      });
    });
    if (file instanceof Blob) {
      reader.readAsDataURL(file);
    }
  }
}
