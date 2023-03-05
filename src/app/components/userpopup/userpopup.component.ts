import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalService } from 'src/services/modal.service';
import { MyUserData } from 'src/services/user.service';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { ImagepickerOptionsData } from 'src/app/mycommon/components/imagepicker/imagepicker.component';
import { MyConstants } from 'srcJs/MyConstants';
import { FileBase64Data } from '../base/base.component';

export interface UserPopUpData {
  newImage?: string;
  changed: boolean;
  old: MyUserData;
  new: MyUserData;
}

@Component({
  selector: 'app-userpopup',
  templateUrl: './userpopup.component.html',
  styleUrls: ['./userpopup.component.css'],
})
export class UserpopupComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  imageOptions: ImagepickerOptionsData = {
    isEditable: true,
    isRounded: true,
    useBackground: false,
    defaultImage: MyConstants.USER.DEFAULT_IMAGE,
  };
  ahora = new Date().getTime();
  respuesta: UserPopUpData;
  constructor(
    private dialogRef: MatDialogRef<UserpopupComponent>,
    private fb: FormBuilder,
    private modalSrv: ModalService,
    @Inject(MAT_DIALOG_DATA) public data: MyUserData
  ) {
    this.respuesta = {
      old: data,
      changed: false,
      new: {
        name: data.name,
        email: data.email, // No se debe poder cambiar si es el id...
        phone: data.phone,
      },
    };
  }

  get name() {
    return this.form.get('name');
  }

  get email() {
    return this.form.get('email');
  }

  get phone() {
    return this.form.get('phone');
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.name, [Validators.required, Validators.maxLength(512)]],
      email: [this.data.email, [Validators.maxLength(512)]],
      phone: [this.data.phone, [Validators.maxLength(512)]],
    });
  }

  getMaxLengthMessage(label: string, error: any | null): string {
    if (error && error.maxlength) {
      return `Máximo ${error.maxlength.requiredLength} letras. Actualmente hay ${error.maxlength.actualLength}.`;
    }
    return '';
  }

  changedImage(imagenBase64: FileBase64Data) {
    if (imagenBase64.base64) {
      this.respuesta.newImage = imagenBase64.base64;
    }
  }

  getImage(): string | null {
    if (typeof this.data.picture == 'string' && this.data.picture.length > 0) {
      return this.data.picture + `?t=${this.ahora}`;
    }
    return null;
  }

  async guardar() {
    if (this.form.valid) {
      // Si ha cambiado la imagen
      if (typeof this.respuesta.newImage == 'string') {
        this.respuesta.changed = true;
      }

      this.respuesta.new.name = this.form.value.name;
      this.respuesta.new.email = this.form.value.email;
      this.respuesta.new.phone = this.form.value.phone;
      this.respuesta.new.picture = this.respuesta.old.picture;
      this.respuesta.new.created = this.respuesta.old.created;

      // o si alguno de los campos ha cambiado
      if (!this.respuesta.changed) {
        const llaves = ['name', 'email', 'phone'];
        for (let i = 0; i < llaves.length; i++) {
          const llave = llaves[i];
          const nuevo: any = this.respuesta.new;
          const viejo: any = this.respuesta.old;
          if (nuevo[llave] != viejo[llave]) {
            this.respuesta.changed = true;
          }
        }
      }
      this.dialogRef.close(this.respuesta);
    } else {
      this.modalSrv.alert({
        title: 'Ups...',
        txt: 'Verifica tus datos antes de continuar.',
      });
    }
  }
}
