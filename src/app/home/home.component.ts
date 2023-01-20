import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../components/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {
  faGamepad = faGamepad;
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    private readonly router: Router
  ) {
    super(route, pageService, cdr, authService, dialog);
  }

  navegar(ruta: string) {
    this.router.navigate(['/', ruta]);
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
