import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PagepopupComponent } from 'src/app/components/pagepopup/pagepopup.component';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    public dialog: MatDialog
  ) {}

  async edit() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.dialog.open(PagepopupComponent);
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
