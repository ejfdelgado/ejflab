import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { AuthorizationpopupComponent } from 'src/app/components/authorizationpopup/authorizationpopup.component';
import { PageData } from 'src/interfaces/login-data.interface';

import { AuthService } from './auth.service';
import { BackendPageService } from './backendPage.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';

export interface PermisionData {
  who: string;
  auth: Array<string>;
  erase?: boolean;
  role: string;
}

export interface AuthorizationPostData {
  id: string;
  lista: Array<PermisionData>;
}

export interface AuthorizationGetData {
  act: number;
  role: string;
  cre: number;
  who: string;
  rsc: string;
  auth: Array<string>;
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    public dialog: MatDialog,
    public pageService: BackendPageService,
    private httpSrv: HttpService
  ) {}

  async readAll(id: string): Promise<Array<AuthorizationGetData>> {
    const response = await this.httpSrv.getAll<AuthorizationGetData>(
      `srv/${id}/auth`,
      {
        key: 'payload',
      }
    );
    return response;
  }

  async save(payload: AuthorizationPostData) {
    await this.httpSrv.post(`srv/${payload.id}/auth`, payload, {
      showIndicator: true,
      showError: true,
    });
  }

  async edit() {
    const promesas = [];
    promesas.push(this.authService.getCurrentUser());
    promesas.push(this.pageService.getCurrentPage());
    const respuestas = await Promise.all<any>(promesas);

    let page: PageData | null = null;
    let usuario: User | null = null;
    [usuario, page] = respuestas;

    if (!usuario) {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
      return;
    }
    if (!page) {
      this.modalService.alert({ txt: 'No hay página que editar' });
      return;
    }
    this.dialog.open(AuthorizationpopupComponent, { data: page });
  }
}
