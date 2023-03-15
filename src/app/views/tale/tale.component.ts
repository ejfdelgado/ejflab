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

export interface PageTaleData {
  t: number;
  ti: number;
  tf: number;
  audioUrl: string | null;
  image1Url: string | null;
  image2Url: string | null;
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
  imageOptions: ImagepickerOptionsData = {
    isEditable: true,
    isRounded: false,
    useBackground: false,
    useRoot: MyConstants.SRV_ROOT,
    autosave: true,
    askType: 'photo',
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
    if (valor.image1Url) {
      promesasBorrar.push(this.fileService.delete(valor.image1Url));
    }
    if (valor.image2Url) {
      promesasBorrar.push(this.fileService.delete(valor.image2Url));
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
