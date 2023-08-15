import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  Inject,
  HostListener,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/components/base/base.component';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileService } from 'src/services/file.service';
import { LoginService } from 'src/services/login.service';
import { ModalService } from 'src/services/modal.service';
import { TupleService } from 'src/services/tuple.service';
import { WebcamService } from 'src/services/webcam.service';
import {
  WhenThenData,
  WhenThenHolderEventData,
} from './components/whenthen/whenthen.component';

@Component({
  selector: 'app-decisiontree',
  templateUrl: './decisiontree.component.html',
  styleUrls: ['./decisiontree.component.css'],
})
export class DecisiontreeComponent
  extends BaseComponent
  implements OnInit, OnChanges
{
  public extraOptions: Array<OptionData> = [];
  public draggingNode: WhenThenData | null = null;
  public draggData = {
    startx: 0,
    starty: 0,
    oldLeft: 0,
    oldTop: 0,
  };
  public whenthenNodes: Array<WhenThenData> = [
    { left: 100, top: 100, text: 'Hey 1' },
    { left: 300, top: 500, text: 'Hey 2' },
  ];
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService,
    public override fileService: FileService,
    public override modalService: ModalService,
    public override webcamService: WebcamService,
    public loginSrv: LoginService,
    //
    @Inject(DOCUMENT) private document: any
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

  holderMouseDown(event: WhenThenHolderEventData) {
    const ev = event.event;
    this.draggData.startx = ev.screenX;
    this.draggData.starty = ev.screenY;
    this.draggData.oldLeft = event.model.left;
    this.draggData.oldTop = event.model.top;
    this.draggingNode = event.model;
  }

  holderMouseUp(event: WhenThenHolderEventData) {
    this.draggingNode = null;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(ev: any) {
    if (this.draggingNode) {
      const menuTop = this.draggingNode;
      menuTop.top =
        this.draggData.oldTop - (this.draggData.starty - ev.screenY);
      menuTop.left =
        this.draggData.oldLeft - (this.draggData.startx - ev.screenX);
    }
  }

  ngOnChanges(changes: any) {}
}
