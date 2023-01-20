import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
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
}
