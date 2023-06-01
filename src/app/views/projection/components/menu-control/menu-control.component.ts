import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { BlobOptionsData } from 'src/app/mycommon/components/blobeditor/blobeditor.component';
import { FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { IdGen } from 'srcJs/IdGen';
import { ModuloSonido } from 'srcJs/ModuloSonido';
import { MyConstants } from 'srcJs/MyConstants';
import {
  GlobalModelData,
  LocalModelData,
  Model3DData,
} from '../../projection.component';

export interface MyOptionData {
  val: string;
  txt: string;
}

@Component({
  selector: 'app-menu-control',
  templateUrl: './menu-control.component.html',
  styleUrls: ['./menu-control.component.css'],
})
export class MenuControlComponent implements OnInit, OnChanges {
  @Input() mymodel: GlobalModelData;
  @Input() localModel: LocalModelData;
  @Output() saveEvent = new EventEmitter<void>();

  blobOptions: BlobOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    autosave: true,
  };

  constructor(
    public fileService: FileService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {}

  async add3DModel() {
    const id = await IdGen.nuevo();
    if (id == null) {
      return;
    }
    if (!this.mymodel.models) {
      this.mymodel.models = {};
    }
    this.mymodel.models[id] = {
      name: `Model ${id}`,
      startTime: 0,
    };
  }

  async delete3DModel(key: string) {
    if (!(key in this.mymodel.models)) {
      return;
    }
    const actual: Model3DData = this.mymodel.models[key];
    const response = await this.modalService.confirm({
      title: `¿Seguro que desea borrar el modelo ${actual.name}?`,
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    const promesasBorrar = [];
    if (actual.objUrl) {
      promesasBorrar.push(this.fileService.delete(actual.objUrl));
    }
    if (actual.videoUrl) {
      promesasBorrar.push(this.fileService.delete(actual.videoUrl));
    }
    await Promise.all(promesasBorrar);
    delete this.mymodel.models[key];
    //this.saveEvent.emit();
  }

  changedView(viewId: string) {
    this.localModel.currentView = this.mymodel.calib[viewId];
  }

  async removeView(viewId: string) {
    const response = await this.modalService.confirm({
      title: `¿Seguro que desea borrar la vista ${viewId}?`,
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    delete this.mymodel.calib[viewId];
    this.localModel.currentView = null;
    this.localModel.currentViewName = null;
  }

  async addView() {
    const id = await IdGen.nuevo();
    if (id == null) {
      return;
    }
    const llavesViejas = Object.keys(this.mymodel.calib);
    const count = llavesViejas.length + 1;
    this.mymodel.calib[id] = {
      name: `Vista ${count}`,
      pairs: {},
    };
    if (this.localModel.currentViewName == null) {
      this.localModel.currentViewName = id;
      this.changedView(id);
    }
  }

  ngOnChanges(changes: any) {
    //console.log(JSON.stringify(changes));
  }

  async playSound() {
    try {
      const response = await ModuloSonido.preload(['/assets/sounds/end.mp3']);
      await ModuloSonido.play('/assets/sounds/end.mp3');
    } catch (err: any) {
      this.modalService.error(err);
    }
  }

  getViewOptionsList(): Array<MyOptionData> {
    const response: Array<MyOptionData> = [];
    const llaves = Object.keys(this.mymodel.calib);
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      const actual: MyOptionData = {
        val: llave,
        txt: this.mymodel.calib[llave].name,
      };
      response.push(actual);
    }
    return response;
  }
}
