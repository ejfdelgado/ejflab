import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageData } from 'src/interfaces/login-data.interface';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';

@Component({
  selector: 'app-base',
  template: ` <p></p> `,
  styles: [],
})
export class BaseComponent implements OnInit, OnDestroy {
  page: PageData | null;
  currentUser: User | null = null;
  loginSubscription: Subscription;
  constructor(
    public route: ActivatedRoute,
    public pageService: BackendPageService,
    public cdr: ChangeDetectorRef,
    public authService: AuthService,
    public dialog: MatDialog
  ) {}

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.cdr.detectChanges();
  }

  async ngOnInit() {
    const promesas: Array<Promise<any>> = [];
    promesas.push(this.pageService.getCurrentPage());
    promesas.push(this.authService.getCurrentUser());

    const respuestas = await Promise.all(promesas);
    this.page = respuestas[0];
    this.setCurrentUser(respuestas[1]);
    this.loginSubscription = this.authService
      .getLoginEvent()
      .subscribe((user: User) => {
        this.setCurrentUser(user);
      });
    /*
    this.route.params.subscribe((params) => {
      if ('id' in params) {
        const id = params['id'];
        console.log(`id = ${id}`);
      }
    });
    */
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }
}
