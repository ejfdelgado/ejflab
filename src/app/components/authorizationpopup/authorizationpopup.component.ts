import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from 'src/services/modal.service';

export interface AuthorizationData {
  who: string;
  auth?: Array<string>;
  role: string;
}

@Component({
  selector: 'app-authorizationpopup',
  templateUrl: './authorizationpopup.component.html',
  styleUrls: ['./authorizationpopup.component.css'],
})
export class AuthorizationpopupComponent implements OnInit {
  faXmark = faXmark;
  faTrash = faTrash;
  form: FormGroup;
  permisos: Array<AuthorizationData> = [];

  constructor(
    private dialogRef: MatDialogRef<AuthorizationpopupComponent>,
    private fb: FormBuilder,
    private modalSrv: ModalService
  ) {
    this.form = new FormGroup({
      formArrayName: this.fb.array([]),
    });

    this.buildForm();
  }

  buildForm(): void {
    const controlArray = this.form.get('formArrayName') as FormArray;

    controlArray.clear();

    for (let i = 0; i < this.permisos.length; i++) {
      controlArray.push(
        this.fb.group({
          role: new FormControl({
            value: this.permisos[i].role,
            disabled: false,
          }),
        })
      );
    }
  }

  ngOnInit(): void {}

  agregarUsuario() {
    //Abre un popup para invitar
    this.permisos.unshift({ who: 'edelgado@panal.co', role: 'none' });
    this.buildForm();
  }

  async borrarUsuario(i: number, usuario: AuthorizationData) {
    const decision = await this.modalSrv.confirm({
      title: 'Borrar usuario',
      txt: '¿Seguro que deseas borrar el usuario?',
    });
    if (!decision) {
      return;
    }
    this.permisos.splice(i, 1);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  async guardar() {
    this.dialogRef.close(false);
  }
}
