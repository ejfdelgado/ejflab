import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthorizationpopupComponent } from 'src/app/components/authorizationpopup/authorizationpopup.component';

import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    public dialog: MatDialog
  ) {}

  async edit() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.dialog.open(AuthorizationpopupComponent);
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
