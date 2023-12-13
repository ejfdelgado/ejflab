import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FileResponseData, FileService } from 'src/services/file.service';
import { SocketActions, UeSocketService } from 'src/services/uesocket.service';
import { FlowChartDiagram } from 'srcJs/FlowChartDiagram';
import { ModuloSonido } from 'srcJs/ModuloSonido';
import { SimpleObj } from 'srcJs/SimpleObj';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit, OnDestroy {
  @ViewChild('mySvg') mySvgRef: ElementRef;
  graphHtml: string = '';
  modelState: any = {};
  selectedView: string = 'chat';
  mymessage: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];

  constructor(
    public socketService: UeSocketService,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public fileService: FileService
  ) {}

  ngOnInit(): void {
    const SOUNDS_ROOT = '/assets/police/sounds';
    ModuloSonido.preload([
      `${SOUNDS_ROOT}/end.mp3`,
      `${SOUNDS_ROOT}/finish.mp3`,
    ]);
    this.socketService.on('chatMessage', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('personalChat', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('buscarParticipantesResponse', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('stateChanged', (content: string) => {
      this.receiveStateChanged('stateChanged', content);
    });
    this.socketService.on('sound', (content: string) => {
      const argumento = JSON.parse(content);
      ModuloSonido.play(`${SOUNDS_ROOT}/${argumento}`);
    });
    this.socketService.on('animate', (content: string) => {
      console.log(`animate ${JSON.stringify(content)}`);
    });
  }

  ngOnDestroy(): void {
    this.socketService.removeAllListeners('chatMessage');
    this.socketService.removeAllListeners('personalChat');
    this.socketService.removeAllListeners('buscarParticipantesResponse');
    this.socketService.removeAllListeners('stateChanged');
    this.socketService.removeAllListeners('sound');
    this.socketService.removeAllListeners('animate');
  }

  selectView(viewName: string) {
    this.selectedView = viewName;
  }

  getGraph(): any {
    let grafo = SimpleObj.getValue(this.modelState, 'zflowchart');
    if (!grafo) {
      grafo = {};
    }
    let currentNodes = SimpleObj.getValue(this.modelState, 'st.current');
    if (!currentNodes) {
      currentNodes = [];
    }
    const svgContent = FlowChartDiagram.computeGraph(grafo, currentNodes);
    this.graphRecomputeBoundingBox();
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  graphRecomputeBoundingBox() {
    setTimeout(() => {
      if (this.mySvgRef) {
        const svg = this.mySvgRef.nativeElement;
        var bbox = svg.getBBox();
        // Update the width and height using the size of the contents
        svg.setAttribute('width', bbox.x + bbox.width + bbox.x);
        svg.setAttribute('height', bbox.y + bbox.height + bbox.y);
      }
    });
    return true;
  }

  receiveStateChanged(key: string, content: string) {
    console.log(`[${key}]`);
    const parsed = JSON.parse(content);
    if (parsed.key == '') {
      this.modelState = parsed.val;
    } else {
      // Se escribe solo el punto que dice key
      this.modelState = Object.assign(
        {},
        SimpleObj.recreate(this.modelState, parsed.key, parsed.val, true)
      );
    }

    this.graphHtml = this.getGraph();
  }

  receiveChatMessage(key: string, message: any) {
    console.log(`[${key}]`);
    this.messages.push(`[${key}] ` + UechatComponent.beatyfull(message));
  }

  static beatyfull(texto: string) {
    try {
      return JSON.stringify(JSON.parse(texto), null, 4);
    } catch (err) {
      return texto;
    }
  }

  updateSample(valor: any): void {
    const MAPEO_SAMPLES: { [key: string]: string } = {
      chatMessage: '""',
      buscarParticipantes: '""',
      createScore: JSON.stringify(UeSocketService.createScoreSample(), null, 4),
      updateScore: JSON.stringify(UeSocketService.updateScoreSample(), null, 4),
      selectScenario: JSON.stringify(
        UeSocketService.selectScenarioSample(),
        null,
        4
      ),
      stateWrite: JSON.stringify(UeSocketService.stateWriteSample(), null, 4),
      stateRead: JSON.stringify(UeSocketService.stateReadSample(), null, 4),
      startGame: JSON.stringify(UeSocketService.startGameSample(), null, 4),
      endGame: JSON.stringify(UeSocketService.endGameSample(), null, 4),
      updateCode: JSON.stringify(UeSocketService.updateCodeSample(), null, 4),
    };
    const key: string = valor.target.value;
    const sample = MAPEO_SAMPLES[key];
    if (typeof sample == 'string') {
      this.mymessage = sample;
    }
  }

  sendMessage(): void {
    if (this.selectedAction != null) {
      this.socketService.emit(this.selectedAction, this.mymessage);
      this.mymessage = '';
      this.selectedAction = null;
    }
  }

  async processFile(responseData: FileResponseData) {
    /*
    const indice = responseData.base64.indexOf(';base64,');
    let mimeType = responseData.base64.substring(0, indice);
    mimeType = mimeType.replace(/^data:/, '');
    const base64 = responseData.base64.substring(indice + 8);
    const buff = Buffer.from(base64, 'base64');
    const blob = new Blob([buff], { type: mimeType });
    */
    if (responseData.canceled !== true) {
      const fileName = responseData.fileName;
      const base64 = responseData.base64;
      this.socketService.emit(
        SocketActions.synchronizeFile,
        JSON.stringify({
          fileName,
          base64,
        })
      );
    }
  }

  askForFile(): void {
    const processFileThis = this.processFile.bind(this);
    this.fileService.sendRequest({ type: 'file' }, processFileThis);
  }
}
