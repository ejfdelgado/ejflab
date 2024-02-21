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
import { ModuloSonido } from 'srcJs/ModuloSonido';
import { MyConstants } from 'srcJs/MyConstants';
import { SimpleObj } from 'srcJs/SimpleObj';
import { LocalPageService } from 'src/services/localpage.service';
import { LocalTupleService } from 'src/services/localtuple.service';
import { CommandSound } from './commands/CommandSound';
import { CommandMute } from './commands/CommandMute';
import { CommandContext } from './commands/CommandGeneric';
import { CommandListenMode } from './commands/CommandListenMode';
import { CommandPopUpOpen } from './commands/CommandPopUpOpen';
import { HasFiles } from './dataaccess/HasFiles';
import { CommandTraining } from './commands/CommandTraining';
import { CommandChatMessage } from './commands/CommandChatMessage';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
  providers: [DictateService],
})
export class UechatComponent
  extends CommandContext
  implements OnInit, OnDestroy, EntityValueHolder
{
  @ViewChild('gallery') galleryComponent: ThreejsGalleryComponent;
  @ViewChild('vr') vr: ThreejsVrComponent;
  @ViewChild('mySvg') mySvgRef: ElementRef;
  @ViewChild('mySvgContainer') mySvgContainerRef: ElementRef | null;
  bindDragEventsThis: any;
  modelStatePath: any = null;
  modelDocument: any = {};
  modelDocumentPath: any = null;
  selectedView: string = 'grafo';
  mymessage: string = '';
  myvoice: string = '';
  mypath: string = 'points';
  selectedAction: SocketActions | null = null;
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
  selectedScenario: string = '';

  public view3dModelsActions: Array<ScrollFilesActionData> = [];

  constructor(
    public socketService: UeSocketService,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    public fileService: FileService,
    private dictateService: DictateService,
    public modalService: ModalService,
    public override localFileService: LocalFileService,
    public localPageService: LocalPageService,
    public localTupleService: LocalTupleService
  ) {
    super(localFileService);
    this.view3dModelsActions.push({
      callback: this.add3dModel.bind(this),
      icon: 'add',
      label: 'Agregar',
    });
  }

  getSocketId(): string | null {
    return this.socketService.socketId;
  }

  emit(key: string, content: string) {
    this.socketService.emit(key, content);
  }

  popUpOpen(argumento: any): Promise<any> {
    const response = this.modalService.generic(argumento);
    return response;
  }

  ngOnInit(): void {
    this.readLocalTuple();
    this.bindDragEventsThis = this.bindDragEvents.bind(this);

    this.socketService.on('chatMessage', (content: string) => {
      new CommandChatMessage(this, 'chatMessage').execute(content);
    });
    this.socketService.on('personalChat', (content: string) => {
      new CommandChatMessage(this, 'personalChat').execute(content);
    });
    this.socketService.on('buscarParticipantesResponse', (content: string) => {
      new CommandChatMessage(this, 'buscarParticipantesResponse').execute(
        content
      );
    });
    this.socketService.on('stateChanged', async (content: string) => {
      // Digest the received changes
      await this.receiveStateChanged('stateChanged', content);
      // Updates the sub model view depending of its path
      this.setPath();
      // Updates the graph view
      this.updateGraphFromModel(this.sanitizer, this.mySvgRef, false);
    });
    this.socketService.on('sound', (content: string) => {
      new CommandSound(this).execute(content);
    });
    this.socketService.on('animate', (content: string) => {
      new CommandPopUpOpen(this).execute(content);
    });
    this.socketService.on('mute', (content: string) => {
      new CommandMute(this).execute(content);
    });
    this.socketService.on('popupopen', async (content: string) => {
      new CommandPopUpOpen(this).execute(content);
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
    this.socketService.on('listenmode', async (content: string) => {
      new CommandListenMode(this).execute(content);
    });
    this.socketService.on('training', async (content: string) => {
      new CommandTraining(this).execute(content);
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
    const mySvgContainerRef = this.mySvgContainerRef?.nativeElement;
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
      const mySvgContainerRef = this.mySvgContainerRef?.nativeElement;
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
      setTimeout(() => {
        this.updateGraphFromModel(this.sanitizer, this.mySvgRef, true);
      });
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

  async callStartGame() {
    console.log('Starting game');
  }
  async callStopGame() {
    ModuloSonido.stopAll();
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
    if (this.selectedScenario == '') {
      this.modalService.error(new Error('Debe seleccionar una opción primero'));
      return;
    }
    this.socketService.emit(
      'selectScenario',
      JSON.stringify({
        name: this.selectedScenario,
      })
    );
  }

  updateSelectedScenario(valor: any) {
    if (
      typeof valor.target.value == 'string' &&
      valor.target.value.length > 0
    ) {
      this.selectedScenario = valor.target.value;
    }
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
          if (this.listenMode.complete !== true) {
            return;
          }
          this.partialSpeechToText = null;
          this.socketService.emit('voice', JSON.stringify(hyp));
        },
        onPartialResults: (hyp: string) => {
          if (this.listenMode.preview !== true) {
            return;
          }
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
    this.galleryComponent.addModel({ url, name }, this.localFileService);
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

  async readLocalTuple() {
    this.modelDocument = await this.localTupleService.read();
    this.setPath();
  }

  async saveDocument() {
    await this.localTupleService.save(this.modelDocument);
  }
}
