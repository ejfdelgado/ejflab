import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '../components/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { CardComponentData } from 'src/interfaces/login-data.interface';
import { HttpService } from 'src/services/http.service';
import { TupleService } from 'src/services/tuple.service';
import { FileService } from 'src/services/file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent extends BaseComponent implements OnInit, OnDestroy {
  faGamepad = faGamepad;
  topCards: Array<CardComponentData> = [];
  secondCards: Array<CardComponentData> = [];
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    private readonly router: Router,
    private readonly httpSrv: HttpService,
    public override tupleService: TupleService,
    public override fileService: FileService
  ) {
    super(
      route,
      pageService,
      cdr,
      authService,
      dialog,
      tupleService,
      fileService
    );
  }

  navegar(ruta: string) {
    this.router.navigate(['/', ruta]);
  }

  override async ngOnInit() {
    await super.ngOnInit();
    const promesas = [];
    promesas.push(
      this.httpSrv.get<Array<CardComponentData>>('assets/json/topApps.json')
    );
    promesas.push(
      this.httpSrv.get<Array<CardComponentData>>('assets/json/secondApps.json')
    );
    const respuestas = await Promise.all(promesas);
    if (respuestas[0] != null) {
      this.topCards = respuestas[0];
    }
    if (respuestas[1] != null) {
      this.secondCards = respuestas[1];
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
