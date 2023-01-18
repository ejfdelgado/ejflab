import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'core/services/auth.service';
import { ModalService } from 'core/services/modal.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginpopupComponent } from './components/loginpopup/loginpopup.component';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
    public dialog: MatDialog
  ) {
    authService.getLoginEvent().subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {}

  async login() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.modalService.alert({ txt: 'Ya hay un usuario autenticado' });
    } else {
      this.dialog.open(LoginpopupComponent);
    }
  }

  async logout() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.authService
        .logout()
        .then(() => this.router.navigate(['/']))
        .catch(this.modalService.error);
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
