import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../components/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog
  ) {
    super(route, pageService, cdr, authService, dialog);
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
