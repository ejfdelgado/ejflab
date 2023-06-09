import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { BackendPageService } from 'src/services/backendPage.service';
import { FileService, frameVideoRequestData } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { TupleService } from 'src/services/tuple.service';
import { WebcamService } from 'src/services/webcam.service';
import { MyConstants } from 'srcJs/MyConstants';
import { BaseComponent } from 'src/app/components/base/base.component';
import {
  AudioCutData,
  AudioOptionsData,
} from 'src/app/libs/wavesurfer/audioeditor/audioeditor.component';
import { ImagepickerOptionsData } from 'src/app/mycommon/components/imagepicker/imagepicker.component';
import {
  CanvasOptionsData,
  ImagesUrlData,
} from 'src/app/mycommon/components/canvaseditor/canvaseditor.component';
import { LoginService } from 'src/services/login.service';
import Crunker from 'crunker';
import { FormControl, FormGroup } from '@angular/forms';

export interface PageTaleData {
  t: number;
  ti: number;
  tf: number;
  audioUrl: string | null;
  canvasUrl?: ImagesUrlData;
  key: string;
  txt?: string;
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
  audioCtx = new window.AudioContext();
  allBlobAudios: Map<string, AudioBuffer> = new Map();
  formGroup = new FormGroup({});
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

  changedText(key: string, val: string | null) {
    this.tupleModel.cuttedAudios[key].txt = val;
  }

  getFormGroupName(key: string) {
    const old = this.formGroup.get(key);
    if (!old) {
      let txt = this.tupleModel.cuttedAudios[key].txt;
      const nuevo = new FormControl({
        value: txt ? txt : 'Texto',
        disabled: false,
      });
      nuevo.valueChanges.subscribe((value) => {
        this.changedText(key, value);
      });
      this.formGroup.addControl(key, nuevo);
    }
    return key;
  }

  pictureVisible: Map<string, boolean> = new Map();
  pictureIsVisible(key: string) {
    return this.pictureVisible.get(key) === true;
  }

  togglePictureVisible(key: string) {
    const old = this.pictureVisible.get(key);
    if (old === true) {
      this.pictureVisible.set(key, false);
    } else {
      this.pictureVisible.set(key, true);
    }
  }

  getCompleteGuion(): frameVideoRequestData {
    const mapeo = this.tupleModel.cuttedAudios;
    const llaves = Object.keys(mapeo).sort();
    const frames = [];
    for (let i = 0; i < llaves.length; i++) {
      const key = llaves[i];
      const frame = mapeo[key];
      const audioUrl = frame.audioUrl;
      if (!audioUrl) {
        throw new Error(`Falta el audio #${i + 1}`);
      }
      if (!frame.canvasUrl || !frame.canvasUrl.merged) {
        throw new Error(`Falta la imagen #${i + 1}`);
      }
      const imageUrl = frame.canvasUrl.merged;
      const duration = frame.t * 1000;
      frames.push({ duration, audioUrl, imageUrl, key });
    }
    return {
      width: this.imageOptions.width,
      height: this.imageOptions.height,
      frames,
      key: 'mygift.gif',
      download: false,
    };
  }

  addAudioBuffer(key: string, blob: Blob) {
    let fileReader = new FileReader();
    let arrayBuffer;

    fileReader.onloadend = async () => {
      arrayBuffer = fileReader.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        const audioBuffer: AudioBuffer = await this.audioCtx.decodeAudioData(
          arrayBuffer
        );
        this.allBlobAudios.set(key, audioBuffer);
      }
    };
    fileReader.readAsArrayBuffer(blob);
  }

  async buildAudio() {
    try {
      const guion = this.getCompleteGuion();
      const crunker = new Crunker();

      // Place all audio buffer into single array
      const audios: Array<AudioBuffer> = [];
      const frames = guion.frames;

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const key = frame.key;
        const audioBuffer = this.allBlobAudios.get(key);
        if (!audioBuffer) {
          this.modalService.alert({
            txt: `No se ha cargado el audio de ${key}`,
          });
          return;
        }
        audios.push(audioBuffer);
      }

      //const merged = crunker.mergeAudio(audios);
      const merged = crunker.concatAudio(audios);
      const exported = crunker.export(merged, 'audio/mp3');
      crunker.download(exported.blob);

      crunker.notSupported(() => {
        // Handle no browser support
      });
    } catch (err: any) {
      this.modalService.error(err);
    }
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
    try {
      const guion = this.getCompleteGuion();
      const response = await this.fileService.generateGif(guion);
      this.download('/' + response.key);
    } catch (err: any) {
      this.modalService.error(err);
    }
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
      merged: `${llave}/merged.jpg`,
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
    this.allBlobAudios.delete(llave);
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
