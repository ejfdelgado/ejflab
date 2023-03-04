import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalService } from 'src/services/modal.service';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { Clipboard } from '@angular/cdk/clipboard';

export interface BlobOptionsData {
  useRoot?: string;
  isEditable?: boolean;
}

export interface FileBase64Data {
  base64: string;
  name: string;
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
  @Output() eventSave = new EventEmitter<FileBase64Data>();
  constructor(
    private httpClient: HttpClient,
    private clipboard: Clipboard,
    private modalSrv: ModalService
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

  processFile(textInput: any) {
    const file: File = textInput.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', (event: any) => {
      let base64 = event.target.result;
      this.eventSave.emit({ base64, name: file.name });
    });
    if (file instanceof Blob) {
      reader.readAsDataURL(file);
    }
  }
}
