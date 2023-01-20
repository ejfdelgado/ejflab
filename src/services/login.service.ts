import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginpopupComponent } from 'src/app/components/loginpopup/loginpopup.component';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    public dialog: MatDialog
  ) {}

  /**
   * <button type="button" (click)="login()">Login</button>
   */
  async login() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.modalService.alert({ txt: 'Ya hay un usuario autenticado' });
    } else {
      this.dialog.open(LoginpopupComponent);
    }
  }

  /**
   * <button type="button" (click)="logout()" *ngIf="currentUser !== null">Logout</button>
   */
  async logout() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.authService.logout().catch(this.modalService.error);
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
