import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { TupleService } from 'src/services/tuple.service';
import { WebcamService } from 'src/services/webcam.service';
import { BaseComponent } from '../components/base/base.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
})
export class CustomersComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService,
    public override fileService: FileService,
    public override modalService: ModalService,
    public override webcamService: WebcamService
  ) {
    super(
      route,
      pageService,
      cdr,
      authService,
      dialog,
      tupleService,
      fileService,
      modalService,
      webcamService
    );
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
