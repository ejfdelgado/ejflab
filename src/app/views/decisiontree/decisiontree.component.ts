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
import { HttpService } from 'src/services/http.service';

export interface DraggingNodeData {
  startx: number;
  starty: number;
  oldLeft: number;
  oldTop: number;
  draggingNode: WhenThenData;
  element: ElementRef;
}

export interface WhenThenArrowData {
  from: string;
  to: string;
  label: string;
}

export interface WhenThenExtraArrowData {
  corner1: CoordinateData;
  corner2: CoordinateData;
  left: number;
  top: number;
  width: number;
  height: number;
  arrow: WhenThenArrowData;
  class: string;
}

export interface CoordinateData {
  x: number;
  y: number;
}

export interface ConnectorPointsData {
  p12: CoordinateData;
  p1_30: CoordinateData;
  p3: CoordinateData;
  p4_30: CoordinateData;
  p6: CoordinateData;
  p7_30: CoordinateData;
  p9: CoordinateData;
  p10_30: CoordinateData;
  center: CoordinateData;
}

export interface WhenThenMoreData {
  model: WhenThenData;
  connectors: ConnectorPointsData;
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
  public whenthenNodeMap: { [key: string]: WhenThenMoreData } = {};
  public whenthenNodes: Array<WhenThenData> = [];
  public whenthenArrows: Array<WhenThenArrowData> = [];
  public whenthenExtraArrowMap: { [key: string]: WhenThenExtraArrowData } = {};
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
    @Inject(DOCUMENT) private document: any,
    private readonly httpSrv: HttpService
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
    this.loadDiagramData();
  }

  ngOnChanges(changes: any) {}

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

  holderMouseUp(ev: MouseEvent) {
    this.draggData = null;
    ev.stopPropagation();
  }

  async deleteNode(node: WhenThenData) {
    //Pedir confirmar
    const response = await this.modalService.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    //Borra las flechas asociadas del nodo
    const idErase = node.id;
    const arrows = this.whenthenArrows;
    let i = 0;
    while (i < arrows.length) {
      const arrow = arrows[i];
      if (arrow.from == idErase || arrow.to == idErase) {
        arrows.splice(i, 1);
      } else {
        i++;
      }
    }

    // Borro el nodo com tal
    const indice = this.whenthenNodes.indexOf(node);
    if (indice >= 0) {
      this.whenthenNodes.splice(indice, 1);
    }

    this.recomputeMaps();
    this.recomputeArrows();
  }

  async loadDiagramData() {
    const promesas = [];
    promesas.push(this.httpSrv.get<Array<any>>('assets/diagrams/diagram.json'));
    const responses = await Promise.all(promesas);
    const model = responses[0] as any;
    this.whenthenNodes = model['nodes'] as Array<WhenThenData>;
    this.whenthenArrows = model['arrows'] as Array<WhenThenArrowData>;
    setTimeout(() => {
      this.recomputeMaps();
      this.recomputeArrows();
    }, 0);
  }

  recomputeMaps() {
    this.whenthenExtraArrowMap = {};
    this.whenthenNodeMap = {};
    const nodos = this.whenthenNodes;
    for (let i = 0; i < nodos.length; i++) {
      const nodo = nodos[i];
      const connectors: ConnectorPointsData = {
        p12: {
          x: nodo.left + nodo.width * 0.5,
          y: nodo.top,
        },
        p1_30: {
          x: nodo.left + nodo.width,
          y: nodo.top,
        },
        p3: {
          x: nodo.left + nodo.width,
          y: nodo.top + nodo.height * 0.5,
        },
        p4_30: {
          x: nodo.left + nodo.width,
          y: nodo.top + nodo.height,
        },
        p6: {
          x: nodo.left + nodo.width * 0.5,
          y: nodo.top + nodo.height,
        },
        p7_30: {
          x: nodo.left,
          y: nodo.top + nodo.height,
        },
        p9: {
          x: nodo.left,
          y: nodo.top + nodo.height * 0.5,
        },
        p10_30: {
          x: nodo.left,
          y: nodo.top,
        },
        center: {
          x: nodo.left + nodo.width * 0.5,
          y: nodo.top + nodo.height * 0.5,
        },
      };
      this.whenthenNodeMap[nodo.id] = {
        model: nodo,
        connectors,
      };
    }
  }

  deduceQuadrant(from: ConnectorPointsData, to: ConnectorPointsData) {
    let xdiff = 0;
    let ydiff = 0;

    xdiff = to.p10_30.x - from.p4_30.x;
    ydiff = to.p10_30.y - from.p4_30.y;
    if (xdiff >= 0 && ydiff >= 0) {
      if (ydiff > xdiff) {
        return 11;
      } else {
        return 12;
      }
    }
    xdiff = to.p7_30.x - from.p1_30.x;
    ydiff = to.p7_30.y - from.p1_30.y;
    if (xdiff >= 0 && ydiff <= 0) {
      if (xdiff > -1 * ydiff) {
        return 21;
      } else {
        return 22;
      }
    }
    xdiff = to.p4_30.x - from.p10_30.x;
    ydiff = to.p4_30.y - from.p10_30.y;
    if (xdiff <= 0 && ydiff <= 0) {
      if (-1 * ydiff > -1 * xdiff) {
        return 31;
      } else {
        return 32;
      }
    }
    xdiff = to.p1_30.x - from.p7_30.x;
    ydiff = to.p1_30.y - from.p7_30.y;
    if (xdiff <= 0 && ydiff >= 0) {
      if (-1 * xdiff > ydiff) {
        return 41;
      } else {
        return 42;
      }
    }
    // Se revisan los extremos en cruz
    xdiff = to.p12.x - from.p6.x;
    ydiff = to.p12.y - from.p6.y;
    if (ydiff >= 0) {
      if (xdiff >= 0) {
        return 11;
      } else {
        return 42;
      }
    }
    xdiff = to.p9.x - from.p3.x;
    ydiff = to.p9.y - from.p3.y;
    if (xdiff >= 0) {
      if (ydiff <= 0) {
        return 21;
      } else {
        return 12;
      }
    }
    xdiff = to.p6.x - from.p12.x;
    ydiff = to.p6.y - from.p12.y;
    if (ydiff <= 0) {
      if (xdiff >= 0) {
        return 22;
      } else {
        return 31;
      }
    }
    xdiff = to.p3.x - from.p9.x;
    ydiff = to.p3.y - from.p9.y;
    if (xdiff <= 0) {
      if (ydiff <= 0) {
        return 32;
      } else {
        return 41;
      }
    }
    // Never reach here
    return 0;
  }

  recomputeArrows() {
    // Se deben recorrer las flechas y asignar las posiciones
    const flechas = this.whenthenArrows;
    const nodeMap = this.whenthenNodeMap;
    for (let i = 0; i < flechas.length; i++) {
      const flecha = flechas[i];
      const fromNode = nodeMap[flecha.from];
      const toNode = nodeMap[flecha.to];
      const quadrantCase = this.deduceQuadrant(
        fromNode.connectors,
        toNode.connectors
      );
      let corner1: CoordinateData = { x: 0, y: 0 };
      let corner2: CoordinateData = { x: 0, y: 0 };

      switch (quadrantCase) {
        case 11:
          corner1 = fromNode.connectors.p6;
          corner2 = toNode.connectors.p12;
          break;
        case 12:
          corner1 = fromNode.connectors.p3;
          corner2 = toNode.connectors.p9;
          break;
        case 21:
          corner1 = fromNode.connectors.p3;
          corner2 = toNode.connectors.p9;
          break;
        case 22:
          corner1 = fromNode.connectors.p12;
          corner2 = toNode.connectors.p6;
          break;
        case 31:
          corner1 = fromNode.connectors.p12;
          corner2 = toNode.connectors.p6;
          break;
        case 32:
          corner1 = fromNode.connectors.p9;
          corner2 = toNode.connectors.p3;
          break;
        case 41:
          corner1 = fromNode.connectors.p9;
          corner2 = toNode.connectors.p3;
          break;
        case 42:
          corner1 = fromNode.connectors.p6;
          corner2 = toNode.connectors.p12;
          break;
      }
      const corner1Copy: CoordinateData = { x: corner1.x, y: corner1.y };
      const corner2Copy: CoordinateData = { x: corner2.x, y: corner2.y };
      if (corner1Copy.x > corner2Copy.x) {
        const min = corner2Copy.x;
        corner2Copy.x = corner1Copy.x;
        corner1Copy.x = min;
      }
      if (corner1Copy.y > corner2Copy.y) {
        const min = corner2Copy.y;
        corner2Copy.y = corner1Copy.y;
        corner1Copy.y = min;
      }
      const arrowExtra: WhenThenExtraArrowData = {
        corner1: corner1Copy,
        corner2: corner2Copy,
        left: corner1Copy.x,
        top: corner1Copy.y,
        width: corner2Copy.x - corner1Copy.x,
        height: corner2Copy.y - corner1Copy.y,
        arrow: flecha,
        class: 'arr_' + quadrantCase,
      };
      const arrowKey = `${flecha.from}-${flecha.to}`;
      this.whenthenExtraArrowMap[arrowKey] = arrowExtra;
    }
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
      this.recomputeMaps();
      this.recomputeArrows();
    }
  }
}
