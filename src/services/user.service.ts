import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserpopupComponent } from 'src/app/components/userpopup/userpopup.component';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';

export interface MyUserData {
  id: string;
  created: number;
  name: string;
  email: string | null;
  phone: string | null;
  picture: string;
  updated: number;
}

@Injectable({
  providedIn: 'root',
})
export class MyUserService {
  usuarioActual: MyUserData | null | undefined = undefined;
  eventoUsuario: EventEmitter<MyUserData> = new EventEmitter<MyUserData>();
  constructor(
    private auth: AuthService,
    private httpSrv: HttpService,
    private modalService: ModalService,
    private dialog: MatDialog
  ) {
    this.auth.getLoginEvent().subscribe((user) => {
      if (user != null) {
        const consultaUsuario = this.httpSrv.get<MyUserData>('srv/usr/me');
        consultaUsuario.then((usuario) => {
          if (usuario) {
            this.usuarioActual = usuario;
            this.eventoUsuario.emit(usuario);
          } else {
            this.usuarioActual = null;
          }
        });
      } else {
        this.usuarioActual = null;
      }
    });
  }

  async getCurrentUser(): Promise<MyUserData | null> {
    if (this.usuarioActual !== undefined) {
      return JSON.parse(JSON.stringify(this.usuarioActual));
    } else {
      return new Promise((resolve) => {
        const subscripcion = this.eventoUsuario.subscribe((usuario) => {
          resolve(JSON.parse(JSON.stringify(usuario)));
          subscripcion.unsubscribe();
        });
      });
    }
  }

  async edit() {
    const usuario = await this.getCurrentUser();
    if (usuario) {
      this.dialog.open(UserpopupComponent, { data: usuario });
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
