import { Buffer } from 'buffer';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThreejsGalleryComponent } from 'src/app/libs/threejs/threejs-gallery/threejs-gallery.component';
import {
  EntityValueHolder,
  ThreejsVrComponent,
} from 'src/app/libs/threejs/threejs-vr/threejs-vr.component';
import { ElementPairItemData } from 'src/app/mycommon/components/scrollfile/scrollfile.component';
import { ScrollFilesActionData } from 'src/app/mycommon/components/scrollfiles/scrollfiles.component';
import { DictateService } from 'src/services/dictate-service';
import { FileResponseData, FileService } from 'src/services/file.service';
import { LocalFileService } from 'src/services/localfile.service';
import { ModalService } from 'src/services/modal.service';
import { SocketActions, UeSocketService } from 'src/services/uesocket.service';
import { CollisionsEngine } from 'srcJs/CollisionsEngine';
import { FlowChartDiagram } from 'srcJs/FlowChartDiagram';
import { ModuloSonido } from 'srcJs/ModuloSonido';
import { MyConstants } from 'srcJs/MyConstants';
import { MyDates } from 'srcJs/MyDates';
import { SimpleObj } from 'srcJs/SimpleObj';
import sortify from 'srcJs/sortify';
import { LocalPageService } from 'src/services/localpage.service';
import { LocalTupleService } from 'src/services/localtuple.service';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
  providers: [DictateService],
})
export class UechatComponent implements OnInit, OnDestroy, EntityValueHolder {
  DEFAULT_SCENARIO = 'caso1-cooperante-si';
  //DEFAULT_SCENARIO = 'color';
  IMAGES_ROOT = 'assets/word-game/';
  SOUNDS_ROOT = 'assets/police/sounds';
  @ViewChild('gallery') galleryComponent: ThreejsGalleryComponent;
  @ViewChild('vr') vr: ThreejsVrComponent;
  @ViewChild('mySvg') mySvgRef: ElementRef;
  @ViewChild('mySvgContainer') mySvgContainerRef: ElementRef;
  bindDragEventsThis: any;
  graphHtml: string = '';
  modelState: any = {};
  modelStatePath: any = null;
  modelDocument: any = {};
  modelDocumentPath: any = null;
  selectedView: string = 'grafo';
  mymessage: string = '';
  myvoice: string = '';
  mypath: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];
  isActive: boolean = false;
  isDragging: boolean = false;
  firstDragX: number = 0;
  firstDragY: number = 0;
  firstScrollX: number = 0;
  firstScrollY: number = 0;
  collision: any = {
    of: '',
    with: '',
  };
  buttonText = 'On';
  partialSpeechToText: null | string = '';
  currentImage = '';
  transcriptSpeechToText = '';
  view3d: any = {
    models: {},
  };
  colorGame: any = {
    color: 'negro',
  };
  showJsonModelValue: string = 'real_time';
  language: string = 'es';
  public view3dModelsActions: Array<ScrollFilesActionData> = [];

  constructor(
    public socketService: UeSocketService,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public fileService: FileService,
    private modalSrv: ModalService,
    private dictateService: DictateService,
    public modalService: ModalService,
    public localFileService: LocalFileService,
    public localPageService: LocalPageService,
    public localTupleService: LocalTupleService
  ) {
    this.view3dModelsActions.push({
      callback: this.add3dModel.bind(this),
      icon: 'add',
      label: 'Agregar',
    });
  }

  ngOnInit(): void {
    this.readLocalTuple();
    this.bindDragEventsThis = this.bindDragEvents.bind(this);

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
        ModuloSonido.play(
          `${MyConstants.SRV_ROOT}${this.SOUNDS_ROOT}/${argumento}`
        );
      } else if (argumento instanceof Array) {
        ModuloSonido.play(
          `${MyConstants.SRV_ROOT}${this.SOUNDS_ROOT}/${argumento[0]}`,
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
        ModuloSonido.stop(
          `${MyConstants.SRV_ROOT}${this.SOUNDS_ROOT}/${argumento}`
        );
      } else if (argumento instanceof Array) {
        ModuloSonido.stop(
          `${MyConstants.SRV_ROOT}${this.SOUNDS_ROOT}/${argumento[0]}`
        );
      }
    });
    this.socketService.on('popupopen', async (content: string) => {
      const argumento = JSON.parse(content);
      //console.log(`popupopen ${content}`);
      const response = await this.modalSrv.generic(argumento);
      // console.log(JSON.stringify(response));
      this.socketService.emit('popupchoice', JSON.stringify(response));
    });
    this.socketService.on('popupclose', (content: string) => {
      const argumento = JSON.parse(content);
      console.log(JSON.stringify(argumento, null, 4));
    });
    this.socketService.on('image', (content: string) => {
      const argumento = JSON.parse(content);
      if (argumento[1] == 'main') {
        this.currentImage = argumento[0];
      }
    });
  }

  bindDragEvents(): void {
    if (!this.mySvgContainerRef) {
      setTimeout(() => {
        this.bindDragEvents();
      });
      return;
    }
    const mySvgContainerRef = this.mySvgContainerRef.nativeElement;
    mySvgContainerRef.addEventListener('mousedown', this.pressEventHandler);
    mySvgContainerRef.addEventListener('mousemove', this.dragEventHandler);
    mySvgContainerRef.addEventListener('mouseup', this.releaseEventHandler);
    mySvgContainerRef.addEventListener('mouseout', this.cancelEventHandler);

    mySvgContainerRef.addEventListener('touchstart', this.pressEventHandler);
    mySvgContainerRef.addEventListener('touchmove', this.dragEventHandler);
    mySvgContainerRef.addEventListener('touchend', this.releaseEventHandler);
    mySvgContainerRef.addEventListener('touchcancel', this.cancelEventHandler);
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const mySvgContainerRef = this.mySvgContainerRef.nativeElement;
    const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
    this.isDragging = true;
    this.firstDragX = mouseX;
    this.firstDragY = mouseY;
    this.firstScrollX = mySvgContainerRef.scrollLeft;
    this.firstScrollY = mySvgContainerRef.scrollTop;
  };

  private dragEventHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (this.isDragging) {
      const mySvgContainerRef = this.mySvgContainerRef.nativeElement;
      const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
      const differenceX = this.firstDragX - mouseX;
      const differenceY = this.firstDragY - mouseY;

      mySvgContainerRef.scrollLeft = this.firstScrollX + differenceX;
      mySvgContainerRef.scrollTop = this.firstScrollY + differenceY;
    }
  };

  private releaseEventHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    this.isDragging = false;
  };

  private cancelEventHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    this.isDragging = false;
  };

  private getCoordinatesFromEvent(e: MouseEvent | TouchEvent) {
    const source = e.target || e.srcElement;
    const touchEvent = e as TouchEvent;
    const mouseEvent = e as MouseEvent;
    let mouseX = touchEvent.changedTouches
      ? touchEvent.changedTouches[0].pageX
      : mouseEvent.pageX;
    let mouseY = touchEvent.changedTouches
      ? touchEvent.changedTouches[0].pageY
      : mouseEvent.pageY;
    /*
    if (source) {
      const el = source as HTMLElement;
      const response = this.getGlobalOffset(el);
      if (response.x !== null) {
        mouseX -= response.x;
      }
      if (response.y !== null) {
        mouseY -= response.y;
      }
    }
    */
    return {
      mouseX,
      mouseY,
    };
  }

  private getGlobalOffset(el: HTMLElement) {
    let x = 0;
    let y = 0;
    x += el.offsetLeft;
    y += el.offsetTop;
    if (el.offsetParent) {
      const response = this.getGlobalOffset(el.offsetParent as HTMLElement);
      x += response.x;
      y += response.y;
    }
    return {
      x,
      y,
    };
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

    if (viewName == 'images') {
      this.load3dModelLists();
    }
  }

  setPath() {
    if (this.mypath.trim() == '') {
      this.modelStatePath = this.modelState;
      this.modelDocumentPath = this.modelDocument;
    } else {
      this.modelStatePath = SimpleObj.getValue(
        this.modelState,
        this.mypath.trim()
      );
      this.modelDocumentPath = SimpleObj.getValue(
        this.modelDocument,
        this.mypath.trim()
      );
    }
    if (this.modelStatePath == undefined) {
      this.modelStatePath = null;
    }
    if (this.modelDocumentPath == undefined) {
      this.modelDocumentPath = null;
    }
    this.modelStatePath = Object.assign({}, this.modelStatePath);
    this.modelDocumentPath = Object.assign({}, this.modelDocumentPath);
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

  getSpeechToText() {
    let speech = SimpleObj.getValue(this.modelState, 'st.voice');
    let transcript = '';
    if (speech instanceof Array) {
      for (let i = 0; i < speech.length; i++) {
        transcript += speech[i].d + ' ';
      }
    }
    this.transcriptSpeechToText = transcript;
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
    //console.log(`[${key}]`);
    const parsed = JSON.parse(content);
    if (parsed.key == '') {
      this.modelState = parsed.val;
    } else {
      // Se escribe solo el punto que dice key
      this.modelState = Object.assign(
        {},
        SimpleObj.recreate(this.modelState, parsed.key, parsed.val, true)
      );
      if (parsed.key.startsWith('st.voice')) {
        this.getSpeechToText();
      }
    }
    this.setPath();

    if (parsed.key.startsWith('avatar.')) {
      const socketId = this.socketService.socketId;
      this.listenAvatarChanges(
        parsed.avatar,
        parsed.prop,
        parsed.val,
        parsed.avatar == socketId
      );
      return;
    }

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
    //console.log(`[${key}]`);
    // Put it on top
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 5);
    const fecha = MyDates.getDayAsContinuosNumberHmmSS(ahora);
    this.messages.unshift(
      `${fecha} [${key}] ` + UechatComponent.beatyfull(message)
    );
    const MAX_LENGTH = 500;
    if (this.messages.length > MAX_LENGTH) {
      this.messages.splice(MAX_LENGTH, this.messages.length - MAX_LENGTH);
    }
  }

  static beatyfull(texto: string) {
    try {
      if (typeof texto == 'string') {
        return sortify(JSON.parse(texto));
      } else {
        return sortify(texto);
      }
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
        name: this.DEFAULT_SCENARIO,
      })
    );
  }

  playScenario(): void {
    this.socketService.emit('startGame', JSON.stringify({}));
  }

  stopScenario(): void {
    this.socketService.emit('endGame', JSON.stringify({}));
  }

  switchSpeechRecognition() {
    if (!this.dictateService.isInitialized()) {
      this.dictateService.init({
        server: MyConstants.getSpeechToTextServer(this.language),
        onResults: (hyp: any) => {
          //console.log(`result ${hyp}`);
          this.partialSpeechToText = null;
          this.socketService.emit('voice', JSON.stringify(hyp));
        },
        onPartialResults: (hyp: string) => {
          let nuevo = '';
          if (this.partialSpeechToText == null) {
            nuevo = hyp;
          } else {
            // get substring
            nuevo = hyp.substring(this.partialSpeechToText.length, hyp.length);
          }
          this.partialSpeechToText = hyp;
          //console.log(`partial ${nuevo}`);
          if (nuevo.trim().length > 0) {
            this.socketService.emit('voice', JSON.stringify(nuevo));
          }
        },
        onError: (code: any, data: any) => {
          console.log(code, data);
        },
        onEvent: (code: any, data: any) => {
          //console.log(code, data);
        },
      });
      this.buttonText = 'Off';
    } else if (this.dictateService.isRunning()) {
      this.dictateService.resume();
      this.buttonText = 'Off';
    } else {
      this.dictateService.pause();
      this.buttonText = 'On';
    }
  }

  async load3dModelLists() {
    this.view3d.models = {};

    const response = await this.fileService.listLocalFiles('/police/models/');

    const list = response.data;

    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      this.view3d.models[`${i}`] = {
        url: element.path,
        name: element.name,
        checked: false,
        otherData: {},
      };
    }
  }

  async open3dModel(oneFile: ElementPairItemData) {
    const url = oneFile.value.url;
    const name = oneFile.value.name;
    this.galleryComponent.addFBXModel({ url, name });
  }

  async delete3DModel(pair: ElementPairItemData) {
    const response = await this.modalService.confirm({
      title: `¿Seguro que desea borrar ${pair.value.name}?`,
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
  }

  async add3dModel() {
    // Este es el botón grande que agrega un modelo que no está en la librería
    console.log('add3dModel');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Get my socket id
    const socketId = this.socketService.socketId;
    if (socketId == null) {
      return;
    }
    if (this.vr) {
      const entityHolder: EntityValueHolder = this;
      this.vr.keyBoardEvent(socketId, event.key, entityHolder);
    }
  }

  async getEntityValue(id: string, key: string): Promise<any> {
    // Read the local model
    const defaultValues: any = {
      rotation: { _x: 0, _y: 0, _z: 0, x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
    };
    let actual = SimpleObj.getValue(this.modelState, `avatar.${id}.${key}`);
    if (!actual) {
      // Initialize it
      this.socketService.emit(
        'stateWrite',
        JSON.stringify({
          key: `avatar.${id}.${key}`,
          val: defaultValues[key],
          mine: false,
        })
      );
      actual = SimpleObj.getValue(defaultValues, `${key}`);
    }
    return actual;
  }

  async setEntityValue(
    id: string,
    key: string,
    value: any,
    isMe: boolean
  ): Promise<void> {
    // emit the changes to socket
    this.socketService.emit(
      'stateWrite',
      JSON.stringify({
        key: `avatar.${id}.${key}`,
        val: value,
        mine: false,
      })
    );
  }

  listenAvatarChanges(avatar: string, prop: string, val: any, isMe: boolean) {
    this.vr?.setEntityValue(avatar, prop, val, isMe);
  }

  vrHeadsetChanged(event: any) {
    const socketId = this.socketService.socketId;
    if (socketId == null) {
      return;
    }
    this.setEntityValue(socketId, 'headset', event, true);
  }

  setLanguage(value: string) {
    this.language = value;
  }

  showJsonModel(value: string) {
    this.showJsonModelValue = value;
  }

  async readFile(path: string): Promise<string> {
    const response = await this.localFileService.readPlainText(path);
    return response;
  }

  async writeFile(path: string, content: string) {
    await this.localFileService.save({
      base64: Buffer.from(content, 'utf8').toString('base64'),
      fileName: path,
    });
  }

  async deleteLocalFile(path: string) {
    await this.localFileService.delete(path);
  }

  async readLocalTuple() {
    this.modelDocument = await this.localTupleService.read();
    this.setPath();
  }

  async saveDocument() {
    await this.localTupleService.save(this.modelDocument);
  }
}
