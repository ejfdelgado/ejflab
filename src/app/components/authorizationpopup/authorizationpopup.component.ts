import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';
import { AdduserrolepopupComponent } from '../adduserrolepopup/adduserrolepopup.component';
import { Inject } from '@angular/core';

export interface AuthorizationData {
  who: string;
  role: string;
  version: number;
}

export interface PermisionData {
  who: string;
  auth: string;
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
  losRoles = MyConstants.ROLES;
  pageCreator: string;
  pageId: string;
  publicRoleId: string;

  constructor(
    private dialogRef: MatDialogRef<AuthorizationpopupComponent>,
    private fb: FormBuilder,
    private modalSrv: ModalService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
      /*
      publicrole: new FormControl({
        value: this.publicRoleId,
        disabled: false,
      }),
      */
      formPublic: this.fb.group({
        publicrole: ['', []],
      }),
      formArrayName: this.fb.array([]),
    });

    this.pageCreator = this.data.usr;
    this.pageId = this.data.id;

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

  ngOnInit(): void {
    // Cargar el modelo de base de datos
  }

  get publicrole() {
    return this.form.get('publicrole');
  }

  async agregarUsuario() {
    //Abre un popup para invitar
    const dialogRef = this.dialog.open(AdduserrolepopupComponent);
    const response = await new Promise<AuthorizationData>((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        resolve(result);
      });
    });
    if (response !== undefined) {
      response.who = response.who.toLowerCase().trim();
      //Lo agrega
      for (let i = 0; i < this.permisos.length; i++) {
        const actual = this.permisos[i];
        if (actual.who == response.who) {
          this.modalSrv.alert({
            txt: `El usuario ${actual.who} ya existe, puedes editarlo más abajo.`,
          });
          return;
        }
      }
      //chequea que el usuario no esté ya en la lista
      this.permisos.unshift(response);
      this.buildForm();
    }
  }

  async borrarUsuario(i: number, usuario: AuthorizationData) {
    const decision = await this.modalSrv.confirm({
      title: 'Borrar usuario',
      txt: `¿Seguro que deseas borrar a ${usuario.who}?`,
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
    // Se transforman
    this.dialogRef.close(false);
  }
}
