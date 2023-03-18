import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { TupleService } from 'src/services/tuple.service';
import { WebcamService } from 'src/services/webcam.service';
import { MyConstants } from 'srcJs/MyConstants';
import { BaseComponent } from 'src/app/components/base/base.component';
import {
  AudioCutData,
  AudioOptionsData,
} from 'src/app/mycommon/components/audioeditor/audioeditor.component';
import { ImagepickerOptionsData } from 'src/app/mycommon/components/imagepicker/imagepicker.component';
import {
  CanvasOptionsData,
  ImagesUrlData,
} from 'src/app/mycommon/components/canvaseditor/canvaseditor.component';
import { LoginService } from 'src/services/login.service';
import Crunker from 'crunker';

export interface PageTaleData {
  t: number;
  ti: number;
  tf: number;
  audioUrl: string | null;
  canvasUrl?: ImagesUrlData;
  key: string;
}

@Component({
  selector: 'app-tale',
  templateUrl: './tale.component.html',
  styleUrls: ['./tale.component.css'],
})
export class TaleComponent extends BaseComponent implements OnInit, OnDestroy {
  audioOptions: AudioOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    canCut: true,
    canDownload: true,
    canUpload: true,
    canDelete: true,
    canSave: false,
    showWaveForm: true,
  };
  audioOptionsReadOnly: AudioOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    canCut: false,
    canDownload: false,
    canUpload: false,
    canDelete: false,
    canSave: true,
    showWaveForm: true,
  };
  imageOptions: CanvasOptionsData = {
    height: 500,
    width: 500,
    useRoot: MyConstants.SRV_ROOT,
  };
  temporalBlobAudios: Map<string, Blob> = new Map();
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
    public loginSrv: LoginService
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

  getCompleteGuion() {
    const mapeo = this.tupleModel.cuttedAudios;
    const llaves = Object.keys(mapeo).sort();
    const frames = [];
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      const frame = mapeo[llave];
      const audioUrl = frame.audioUrl;
      const imageUrl = frame.canvasUrl.merged;
      const duration = frame.t * 1000;
      frames.push({ duration, audioUrl, imageUrl });
    }
    return {
      width: this.imageOptions.width,
      height: this.imageOptions.height,
      frames,
      key: 'mygift.gif',
      download: false,
    };
  }

  async buildAudio() {
    const guion = this.getCompleteGuion();
    console.log(JSON.stringify(guion));
    /*
    const crunker = new Crunker();
    crunker
      .fetchAudio('/voice.mp3', '/background.mp3')
      .then((buffers) => crunker.mergeAudio(buffers))
      .then((merged) => crunker.export(merged, 'audio/mp3'))
      .then((output) => crunker.download(output.blob))
      .catch((error) => {
        throw new Error(error);
      });
      */
  }

  download(url: string) {
    let theUrl = this.getCompleteUrl(url);
    console.log(theUrl);
    if (theUrl) {
      window.open(theUrl, '_blank');
    }
  }

  getCompleteUrl(url: string | null) {
    if (url == null) {
      return null;
    }
    let theUrl = url;
    theUrl = MyConstants.SRV_ROOT + url.replace(/^\/+/, '');
    if (theUrl.startsWith('/')) {
      theUrl = `${location.origin}${theUrl}`;
    }
    return theUrl;
  }

  async buildGif() {
    const guion = this.getCompleteGuion();
    const response = await this.fileService.generateGif(guion);
    this.download('/' + response.key);
  }

  castPageData(dato: any): PageTaleData {
    return dato;
  }

  forgetTemporalBlob(llave: string) {
    this.temporalBlobAudios.delete(llave);
  }

  getDefaultCanvasImageName(llave: string): ImagesUrlData {
    return {
      actor: `${llave}/actor.png`,
      background: `${llave}/background.jpg`,
      sketch: `${llave}/sketch.png`,
      merged: `${llave}/merged.png`,
    };
  }

  getTemporalBlob(llave: string): Blob | null {
    const blob = this.temporalBlobAudios.get(llave);
    if (blob) {
      return blob;
    }
    return null;
  }

  trackByItems(index: number, item: any) {
    return item.key;
  }

  talePageOrder(a: any, b: any) {
    if (a.key == b.key) {
      return 0;
    }
    // The oldest on top
    if (a.key > b.key) {
      return 1;
    } else {
      return -1;
    }
  }

  getTalePageMap(): Map<string, PageTaleData> {
    const mapa: Map<string, PageTaleData> = this.tupleModel.cuttedAudios;
    return mapa;
  }

  async deleteTalePage(llave: string, valor: PageTaleData) {
    const respuesta = await this.modalService.confirm({
      txt: 'No se puede deshacer la acción',
      title: '¿Estás seguro?',
    });
    if (!respuesta) {
      return;
    }
    const promesasBorrar = [];
    if (valor.audioUrl) {
      promesasBorrar.push(this.fileService.delete(valor.audioUrl));
    }
    if (valor.canvasUrl?.actor) {
      promesasBorrar.push(this.fileService.delete(valor.canvasUrl.actor));
    }
    if (valor.canvasUrl?.background) {
      promesasBorrar.push(this.fileService.delete(valor.canvasUrl.background));
    }
    if (valor.canvasUrl?.sketch) {
      promesasBorrar.push(this.fileService.delete(valor.canvasUrl.sketch));
    }
    if (valor.canvasUrl?.merged) {
      promesasBorrar.push(this.fileService.delete(valor.canvasUrl.merged));
    }
    await Promise.all(promesasBorrar);
    if (llave in this.tupleModel.cuttedAudios) {
      delete this.tupleModel.cuttedAudios[llave];
    }
    await this.saveTuple();
  }

  async receiveCuttedAudio(event: AudioCutData) {
    if (!this.tupleModel.cuttedAudios) {
      this.tupleModel.cuttedAudios = {};
    }
    const id = await super.generateId();
    this.tupleModel.cuttedAudios[id] = {
      t: event.t,
      ti: event.ti,
      tf: event.tf,
      key: id,
      image1Url: MyConstants.PAGE.DEFAULT_IMAGE,
      image2Url: MyConstants.PAGE.DEFAULT_IMAGE,
    };
    this.temporalBlobAudios.set(id, event.blob);
    await this.saveTuple();
  }

  async borrarTodo() {
    this.tupleModel.cuttedAudios = {};
    await this.saveTuple();
  }

  override onTupleReadDone() {
    if (!this.tupleModel.cuttedAudios) {
      this.tupleModel.cuttedAudios = {};
      this.saveTuple();
    }
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
