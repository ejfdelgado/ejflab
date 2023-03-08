import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/services/modal.service';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { Clipboard } from '@angular/cdk/clipboard';
import { FileBase64Data } from 'src/app/components/base/base.component';
import {
  FileResponseData,
  FileSaveData,
  FileService,
} from 'src/services/file.service';

export interface BlobOptionsData {
  useRoot?: string;
  isEditable?: boolean;
  autosave?: boolean;
}

@Component({
  selector: 'app-blobeditor',
  templateUrl: './blobeditor.component.html',
  styleUrls: ['./blobeditor.component.css'],
})
export class BlobeditorComponent implements OnInit {
  faEllipsisVerticalIcon = faEllipsisVertical;
  @Input() options: BlobOptionsData;
  @Input() url: string | null;
  @Output() urlChange = new EventEmitter<string | null>();
  @Output() eventSave = new EventEmitter<FileBase64Data>();
  constructor(
    private httpClient: HttpClient,
    private clipboard: Clipboard,
    private modalSrv: ModalService,
    public fileService: FileService
  ) {}

  ngOnInit(): void {}

  async download() {
    let theUrl = this.getCompleteUrl(this.url + '&download=1');
    if (theUrl) {
      window.open(theUrl, '_blank');
    }
  }

  async share() {
    let theUrl = this.getCompleteUrl(this.url);
    if (theUrl) {
      this.clipboard.copy(theUrl);
      this.modalSrv.alert({ title: 'Ok!', txt: 'Enlace copiado' });
    }
  }

  getCompleteUrl(url: string | null) {
    if (url == null) {
      return null;
    }
    let theUrl = url;
    if (typeof this.options.useRoot == 'string') {
      theUrl = this.options.useRoot + url.replace(/^\/+/, '');
    }
    if (theUrl.startsWith('/')) {
      theUrl = `${location.origin}${theUrl}`;
    }
    return theUrl;
  }

  getFileName() {
    if (!this.url) {
      return '';
    } else {
      const partes = /[^/]+$/g.exec(this.url);
      if (partes != null) {
        return partes[0].replace(/[?].*$/, '');
      } else {
        return '';
      }
    }
  }

  public async saveFile(options: FileSaveData, suffix: string = '') {
    try {
      const response = await this.fileService.save(options);
      response.key = response.key + '?t=' + new Date().getTime() + suffix;
      return response;
    } catch (err: any) {
      this.modalSrv.error(err);
      throw err;
    }
  }

  askForFile() {
    const processFileThis = this.processFile.bind(this);
    this.fileService.sendRequest({ type: 'file' }, processFileThis);
  }

  async processFile(responseData: FileResponseData) {
    if (this.options.autosave === true) {
      const response = await this.saveFile({
        base64: responseData.base64,
        fileName: responseData.fileName,
        erasefile: this.url, // send old file
      });
      this.url = response.key;
      this.urlChange.emit(this.url);
    } else {
      this.eventSave.emit({
        base64: responseData.base64,
        name: responseData.fileName,
        type: 'blob',
      });
    }
  }
}
