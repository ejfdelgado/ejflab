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
import { BaseComponent } from '../components/base/base.component';
import {
  AudioCutData,
  AudioOptionsData,
} from '../mycommon/components/audioeditor/audioeditor.component';

export interface PageTaleData {
  t: number;
  ti: number;
  tf: number;
  audioUrl: string | null;
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
  temporalBlobAudios: Map<string, Blob> = new Map();
  talePageList: Array<any> = [];
  constructor(
    public override route: ActivatedRoute,
    public override pageService: BackendPageService,
    public override cdr: ChangeDetectorRef,
    public override authService: AuthService,
    public override dialog: MatDialog,
    public override tupleService: TupleService,
    public override fileService: FileService,
    public override modalService: ModalService,
    public override webcamService: WebcamService
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

  castPageData(dato: any): PageTaleData {
    return dato;
  }

  computeTalePageList() {
    this.talePageList.splice(0, this.talePageList.length);
    const llaves = Object.keys(this.tupleModel.cuttedAudios).sort();
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      const actual = this.tupleModel.cuttedAudios[llave];
      this.talePageList.push(actual);
    }
  }

  forgetTemporalBlob(llave: string) {
    this.temporalBlobAudios.delete(llave);
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

  setAudioUrl(key: string, url: string | null, referencia: any) {
    referencia.audioUrl = url;
    this.tupleModel.cuttedAudios[key] = referencia;
  }

  async deleteTalePage(valor: PageTaleData) {
    const respuesta = await this.modalService.confirm({
      txt: 'No se puede deshacer la acción',
      title: '¿Estás seguro?',
    });
    if (!respuesta) {
      return;
    }
    if (valor.audioUrl) {
      await this.fileService.delete(valor.audioUrl);
    }
    if (valor.key in this.tupleModel.cuttedAudios) {
      delete this.tupleModel.cuttedAudios[valor.key];
    }
    // Lo quito de la lista también
    const indice = this.talePageList.indexOf(valor);
    if (indice >= 0) {
      this.talePageList.splice(indice, 1);
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
    };
    this.temporalBlobAudios.set(id, event.blob);
    this.computeTalePageList();
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
    this.computeTalePageList();
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
