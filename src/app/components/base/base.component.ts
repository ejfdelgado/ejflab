import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageData } from 'src/interfaces/login-data.interface';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { TupleService, TupleServiceInstance } from 'src/services/tuple.service';

@Component({
  selector: 'app-base',
  template: ` <p></p> `,
  styles: [],
})
export class BaseComponent implements OnInit, OnDestroy {
  tupleModel: any | null = null;
  page: PageData | null = null;
  currentUser: User | null = null;
  loginSubscription: Subscription;
  pageSubscription: Subscription;
  tupleServiceInstance: TupleServiceInstance | null;
  constructor(
    public route: ActivatedRoute,
    public pageService: BackendPageService,
    public cdr: ChangeDetectorRef,
    public authService: AuthService,
    public dialog: MatDialog,
    public tupleService: TupleService
  ) {}

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.cdr.detectChanges();
  }

  private updateDinamicallyOgData(page: PageData | null) {
    if (page != null) {
      if (page.tit) {
        document.title = page.tit;
      }
    }
  }

  public saveTuple() {
    if (this.tupleServiceInstance) {
      this.tupleServiceInstance.save(this.tupleModel);
    }
  }

  async ngOnInit() {
    const promesas: Array<Promise<any>> = [];
    const updateDinamicallyOgDataThis = this.updateDinamicallyOgData.bind(this);
    this.pageSubscription = this.pageService.evento.subscribe(
      updateDinamicallyOgDataThis
    );
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
    if (this.page && this.page.id) {
      // Try to read tuples, should be optional
      this.tupleServiceInstance = this.tupleService.getReader(this.page.id);
      this.tupleServiceInstance.evento.subscribe((evento) => {
        console.log(JSON.stringify(evento));
        if (evento.status == 'read_wip') {
          // Show read indicator
        } else if (evento.status == 'read_done') {
          // Stop read indicator
          this.tupleModel = evento.body;
        } else if (evento.status == 'write_wip') {
          // Show write indicator
        } else if (evento.status == 'write_done') {
          // Stop write indicator
        }
      });
    }

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
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
  }
}
