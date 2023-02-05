import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { TupleService } from 'src/services/tuple.service';
import { BaseComponent } from '../components/base/base.component';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css'],
})
export class CvComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService
  ) {
    super(route, pageService, cdr, authService, dialog, tupleService);
  }

  setTime() {
    if (!this.tupleModel) {
      return;
    }
    this.tupleModel.t = [new Date().getTime()];
    super.saveTuple();
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
