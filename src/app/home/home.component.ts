import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { ModalService } from 'src/services/modal.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginpopupComponent } from './components/loginpopup/loginpopup.component';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  loginSubscription: Subscription;
  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.authService.getCurrentUser().then((user) => {
      this.setCurrentUser(user);
    });
    this.loginSubscription = this.authService
      .getLoginEvent()
      .subscribe((user: User) => {
        this.setCurrentUser(user);
      });
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

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
