import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { User } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageData } from 'src/interfaces/login-data.interface';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileSaveData, FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import {
  TupleData,
  TupleService,
  TupleServiceInstance,
} from 'src/services/tuple.service';
import { MyConstants } from 'srcJs/MyConstants';

@Component({
  selector: 'app-base',
  template: ` <p></p> `,
  styles: [],
})
export class BaseComponent implements OnInit, OnDestroy {
  tupleModel: any | null = null;
  page: PageData | null = null;
  currentUser: User | null = null;
  loginSubscription: Subscription | null = null;
  pageSubscription: Subscription | null = null;
  tupleSubscription: Subscription | null = null;
  tupleServiceInstance: TupleServiceInstance | null;
  constructor(
    public route: ActivatedRoute,
    public pageService: BackendPageService,
    public cdr: ChangeDetectorRef,
    public authService: AuthService,
    public dialog: MatDialog,
    public tupleService: TupleService,
    public fileService: FileService,
    public modalService: ModalService
  ) {}

  private setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.cdr.detectChanges();
  }

  private updateDinamicallyOgData(page: PageData | null) {
    if (page != null) {
      if (page.tit) {
        document.title = page.tit;
        // document.getElementById('meta_page_id')?.getAttribute("content");
        const metaPageId = document.getElementById('meta_page_id');
        if (metaPageId && typeof page.id == 'string') {
          metaPageId.setAttribute('content', page.id);
        }
      }
    }
  }

  public async saveFile(options: FileSaveData) {
    try {
      const response = await this.fileService.save(options);
      response.key =
        MyConstants.SRV_ROOT + response.key + '?t=' + new Date().getTime();
      return response;
    } catch (err: any) {
      this.modalService.error(err);
      throw err;
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
      .subscribe((user: User | null) => {
        this.setCurrentUser(user);
      });
    this.route.params.subscribe((params) => {
      let pageId = null;
      if ('id' in params) {
        pageId = params['id'];
      } else {
        if (this.page && this.page.id) {
          pageId = this.page.id;
        }
      }
      if (pageId) {
        // Try to read tuples, should be optional
        this.tupleServiceInstance = this.tupleService.getReader(pageId);
        this.tupleSubscription = this.tupleServiceInstance.evento.subscribe(
          (evento) => {
            //console.log(JSON.stringify(evento));
            if (evento.status == 'read_wip') {
              // Show read indicator
            } else if (evento.status == 'read_done') {
              // Stop read indicator
              this.tupleModel = evento.body;
              this.onTupleReadDone();
            } else if (evento.status == 'news') {
              // Stop read indicator
              this.tupleModel = evento.body;
            } else if (evento.status == 'write_wip') {
              // Show write indicator
            } else if (evento.status == 'write_done') {
              // Stop write indicator
              this.onTupleWriteDone();
            }
          }
        );
      }
    });
  }

  onTupleReadDone() {}

  onTupleWriteDone() {}

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
    if (this.tupleSubscription) {
      this.tupleSubscription.unsubscribe();
    }
  }
}
