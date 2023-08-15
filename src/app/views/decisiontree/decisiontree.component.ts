import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  Inject,
  HostListener,
  ElementRef,
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

export interface DraggingNodeData {
  startx: number;
  starty: number;
  oldLeft: number;
  oldTop: number;
  draggingNode: WhenThenData;
  element: ElementRef;
}

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
  public draggData: DraggingNodeData | null = null;
  public whenthenNodes: Array<WhenThenData> = [
    {
      left: 100,
      top: 100,
      width: 0,
      height: 0,
      text: 'The problem is that both of them are undefined at the beginning. I can only update the values which will also update the HTML element but I cannot read it? Is that suppose to be that way? And if yes what alternative do I have to retrieve the current position of the HTML element.',
    },
    { left: 300, top: 500, width: 0, height: 0, text: 'Hey 2' },
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
    this.draggData = {
      startx: ev.screenX,
      starty: ev.screenY,
      oldLeft: event.model.left,
      oldTop: event.model.top,
      draggingNode: event.model,
      element: event.element,
    };
    ev.stopPropagation();
  }

  holderMouseUp(ev: any) {
    this.draggData = null;
    ev.stopPropagation();
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(ev: any) {
    if (this.draggData) {
      const model = this.draggData.draggingNode;
      const element = this.draggData.element;
      model.width = element.nativeElement.clientWidth;
      model.height = element.nativeElement.clientHeight;
      model.top = this.draggData.oldTop - (this.draggData.starty - ev.screenY);
      model.left =
        this.draggData.oldLeft - (this.draggData.startx - ev.screenX);
    }
  }

  ngOnChanges(changes: any) {}
}
