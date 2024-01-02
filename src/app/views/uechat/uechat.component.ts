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
import { ModalService } from 'src/services/modal.service';
import { SocketActions, UeSocketService } from 'src/services/uesocket.service';
import { CollisionsEngine } from 'srcJs/CollisionsEngine';
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
  modelStatePath: any = null;
  selectedView: string = 'chat';
  mymessage: string = '';
  myvoice: string = '';
  mypath: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];
  isActive: boolean = false;
  collision: any = {
    of: '',
    with: '',
  };

  constructor(
    public socketService: UeSocketService,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public fileService: FileService,
    private modalSrv: ModalService
  ) {}

  ngOnInit(): void {
    const SOUNDS_ROOT = '/assets/police/sounds';
    ModuloSonido.preload([
      `${SOUNDS_ROOT}/end.mp3`,
      `${SOUNDS_ROOT}/noise.wav`,
      `${SOUNDS_ROOT}/finish.mp3`,
      `${SOUNDS_ROOT}/mario-coin.mp3`,
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
      if (typeof argumento == 'string') {
        ModuloSonido.play(`${SOUNDS_ROOT}/${argumento}`);
      } else if (argumento instanceof Array) {
        ModuloSonido.play(
          `${SOUNDS_ROOT}/${argumento[0]}`,
          argumento[1] == 'loop'
        );
      }
    });
    this.socketService.on('animate', (content: string) => {
      console.log(`animate ${JSON.stringify(content)}`);
    });
    this.socketService.on('mute', (content: string) => {
      const argumento = JSON.parse(content);
      if (typeof argumento == 'string') {
        ModuloSonido.stop(`${SOUNDS_ROOT}/${argumento}`);
      } else if (argumento instanceof Array) {
        ModuloSonido.stop(`${SOUNDS_ROOT}/${argumento[0]}`);
      }
    });
    this.socketService.on('popupopen', async (content: string) => {
      const argumento = JSON.parse(content);
      const response = await this.modalSrv.generic(argumento);
      // console.log(JSON.stringify(response));
      this.socketService.emit('popupchoice', JSON.stringify(response));
    });
    this.socketService.on('popupclose', (content: string) => {
      const argumento = JSON.parse(content);
      console.log(JSON.stringify(argumento, null, 4));
    });
  }

  ngOnDestroy(): void {
    this.socketService.removeAllListeners('chatMessage');
    this.socketService.removeAllListeners('personalChat');
    this.socketService.removeAllListeners('buscarParticipantesResponse');
    this.socketService.removeAllListeners('stateChanged');
    this.socketService.removeAllListeners('sound');
    this.socketService.removeAllListeners('animate');
    this.socketService.removeAllListeners('mute');
    this.socketService.removeAllListeners('popupopen');
    this.socketService.removeAllListeners('popupclose');
  }

  selectView(viewName: string) {
    this.selectedView = viewName;
    if (this.selectedView == 'grafo') {
      this.graphHtml = this.getGraph();
      this.graphRecomputeBoundingBox();
    }
  }

  setPath() {
    if (this.mypath == '') {
      this.modelStatePath = this.modelState;
    } else {
      this.modelStatePath = SimpleObj.getValue(this.modelState, this.mypath);
    }
    if (this.modelStatePath == undefined) {
      this.modelStatePath = null;
    }
    this.modelStatePath = Object.assign({}, this.modelStatePath);
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
    let history = SimpleObj.getValue(this.modelState, 'st.history');
    if (!history) {
      history = [];
    }
    const svgContent = FlowChartDiagram.computeGraph(
      grafo,
      currentNodes,
      history
    );
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
    this.setPath();

    this.graphHtml = this.getGraph();
    this.graphRecomputeBoundingBox();
    if (this.modelState.st) {
      if (this.modelState.st.current == null && this.isActive) {
        this.callStopGame();
        this.isActive = false;
      } else if (this.modelState.st.current !== null && !this.isActive) {
        this.callStartGame();
        this.isActive = true;
      }
    }
  }

  async callStartGame() {
    console.log('Starting game');
  }
  async callStopGame() {
    ModuloSonido.stopAll();
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

  sendVoice(): void {
    this.socketService.emit('voice', JSON.stringify(this.myvoice));
    this.myvoice = '';
  }

  collide(): void {
    const collision = this.collision;
    collision.of = collision.of.trim();
    collision.with = collision.with.trim();
    if (collision.of.length == 0 || collision.with.length == 0) {
      return;
    }
    const compoundKey = CollisionsEngine.getCompoundKey(
      collision.of,
      collision.with
    );
    this.socketService.emit('touch', JSON.stringify(compoundKey));
  }

  uncollide(): void {
    const collision = this.collision;
    collision.of = collision.of.trim();
    collision.with = collision.with.trim();
    if (collision.of.length == 0 || collision.with.length == 0) {
      return;
    }
    const compoundKey = CollisionsEngine.getCompoundKey(
      collision.of,
      collision.with
    );
    this.socketService.emit('untouch', JSON.stringify(compoundKey));
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

  reloadScenario(): void {
    this.socketService.emit(
      'selectScenario',
      JSON.stringify({
        name: 'caso1-cooperante',
      })
    );
  }

  playScenario(): void {
    this.socketService.emit('startGame', JSON.stringify({}));
  }

  stopScenario(): void {
    this.socketService.emit('endGame', JSON.stringify({}));
  }
}
