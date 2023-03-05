import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { ImagepickerOptionsData } from 'src/app/mycommon/components/imagepicker/imagepicker.component';
import { PageData } from 'src/interfaces/login-data.interface';
import { BackendPageService } from 'src/services/backendPage.service';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';
import { FileBase64Data } from '../base/base.component';

@Component({
  selector: 'app-pagepopup',
  templateUrl: './pagepopup.component.html',
  styleUrls: ['./pagepopup.component.css'],
})
export class PagepopupComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  pageData: PageData;
  changedImageValue: string;
  ahora: number;
  imageOptions: ImagepickerOptionsData = {
    isEditable: true,
    isRounded: false,
    useBackground: true,
    defaultImage: MyConstants.PAGE.DEFAULT_IMAGE,
  };
  constructor(
    private dialogRef: MatDialogRef<PagepopupComponent>,
    private fb: FormBuilder,
    private backendPageSrv: BackendPageService,
    private modalSrv: ModalService
  ) {
    this.ahora = new Date().getTime();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(64)]],
      description: ['', [Validators.maxLength(512)]],
    });
    this.backendPageSrv
      .getCurrentPage()
      .then((data: PageData | null) => {
        if (!data) {
          this.dialogRef.close(false);
          return;
        }
        this.pageData = data;
        this.form.setValue({
          title: data.tit,
          description: data.desc,
        });
      })
      .catch((err) => {});
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
  }

  changedImage(imagenBase64: FileBase64Data) {
    if (imagenBase64.base64) {
      this.changedImageValue = imagenBase64.base64;
    }
  }

  getPageImage(): string | null {
    if (
      this.pageData &&
      typeof this.pageData.img == 'string' &&
      this.pageData.img.length > 0
    ) {
      return this.pageData.img + `?t=${this.ahora}`;
    }
    return null;
  }

  getMaxLengthMessage(label: string, error: any | null): string {
    if (error && error.maxlength) {
      return `Máximo ${error.maxlength.requiredLength} letras. Actualmente hay ${error.maxlength.actualLength}.`;
    }
    return '';
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  async guardar() {
    const valores = {
      tit: this.form.value.title,
      desc: this.form.value.description,
      image: this.changedImageValue,
    };
    if (this.pageData.id) {
      try {
        await this.backendPageSrv.savePage(this.pageData.id, valores);
        await this.modalSrv.alert({
          title: 'Listo',
          txt: 'Guardado correctamente',
        });
        this.dialogRef.close(false);
      } catch (err: any) {
        this.modalSrv.alert({
          title: 'Ups!',
          txt: err.message,
        });
      }
    }
  }
}
