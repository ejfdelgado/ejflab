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
import {
  AuthorizationService,
  PermisionData,
} from 'src/services/authorization.service';

export interface AuthorizationData {
  who: string;
  role: string;
  version: number;
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
  pendientesBorrar: Array<AuthorizationData> = [];
  permisoPublicoInicial: string | null;

  constructor(
    private dialogRef: MatDialogRef<AuthorizationpopupComponent>,
    private fb: FormBuilder,
    private modalSrv: ModalService,
    public dialog: MatDialog,
    public authSrv: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
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

  async ngOnInit(): Promise<void> {
    // Cargar el modelo de base de datos
    const respuesta = await this.authSrv.readAll(this.pageId);
    for (let i = 0; i < respuesta.length; i++) {
      const actual = respuesta[i];
      if (actual.who == '') {
        const controlGroup = this.form.get('formPublic') as FormGroup;
        controlGroup.get('publicrole')?.setValue(actual.role);
        this.permisoPublicoInicial = actual.role;
      } else {
        this.permisos.push({
          role: actual.role,
          who: actual.who,
          version: 0,
        });
      }
    }
    this.buildForm();
  }

  get publicrole() {
    const controlGroup = this.form.get('formPublic') as FormGroup;
    return controlGroup.get('publicrole');
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
    const sacado = this.permisos.splice(i, 1)[0];
    this.pendientesBorrar.push(sacado);
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  definirModificado(permiso: AuthorizationData) {
    permiso.version = 1;
  }

  async guardar() {
    try {
      const value = this.form.value;

      const data: { id: string; lista: Array<PermisionData> } = {
        id: this.pageId,
        lista: [],
      };
      const publicrole: string | null | undefined =
        value?.formPublic?.publicrole;
      if (
        typeof publicrole == 'string' &&
        publicrole.length > 0 &&
        this.permisoPublicoInicial != publicrole
      ) {
        data.lista.push({
          who: '',
          auth: MyConstants.getAuthByRole(publicrole),
          role: publicrole,
        });
      }
      const permisos = this.permisos;
      for (let i = 0; i < permisos.length; i++) {
        const permiso = permisos[i];
        if (permiso.version > 0) {
          const arregloFormulario = value.formArrayName;
          const theRole = arregloFormulario[i].role;
          data.lista.push({
            who: permiso.who,
            auth: MyConstants.getAuthByRole(theRole),
            role: theRole,
          });
        }
      }
      // Agrego los que se deben borrar
      for (let i = 0; i < this.pendientesBorrar.length; i++) {
        const pendiente = this.pendientesBorrar[i];
        data.lista.push({
          who: pendiente.who,
          auth: [],
          erase: true,
          role: '',
        });
      }
      if (data.lista.length == 0) {
        this.dialogRef.close();
      } else {
        try {
          await this.authSrv.save(data);
          this.modalSrv.alert({ tit: 'Ok!', txt: 'Guardado correctamente' });
          this.dialogRef.close();
          this.pendientesBorrar = [];
        } catch (err) {}
      }
    } catch (err: any) {
      this.modalSrv.alert({ tit: 'Ups', txt: err.message });
    }
  }
}
