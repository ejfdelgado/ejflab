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
  TheStateViewData,
  ViewModelData,
} from '../../projection.component';
import { VideoCanvasEventData } from '../video-canvas/video-canvas.component';

export interface TabElementData {
  label: string;
  id: string;
}

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
  @Input() states: TheStateViewData;
  @Output() saveEvent = new EventEmitter<void>();
  @Output() load3DModel = new EventEmitter<{
    uid: string;
    url: string | null;
  }>();
  @Output() remove3DModel = new EventEmitter<string>();
  @Output() imageOut = new EventEmitter<VideoCanvasEventData>();
  @Output() fullScreenEvent = new EventEmitter<boolean>();
  @Output() calibrateEvent = new EventEmitter<void>();
  @Output() useControlsEvent = new EventEmitter<void>();
  @Output() askErasePointEvent = new EventEmitter<string>();
  @Output() askLocatePointEvent = new EventEmitter<string>();
  @Output() changedFovEvent = new EventEmitter<number>();
  @Output() changedViewEvent = new EventEmitter<ViewModelData>();

  tabOptions: Array<TabElementData> = [
    {
      label: 'Objetos 3D',
      id: 'object3d',
    },
    {
      label: 'Vistas',
      id: 'views',
    },
    {
      label: 'Play',
      id: 'play',
    },
    {
      label: 'Debug',
      id: 'debug_local_model',
    },
  ];

  blobOptions: BlobOptionsData = {
    useRoot: MyConstants.SRV_ROOT,
    autosave: true,
  };

  constructor(
    public fileService: FileService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {}

  openTab(tab: string) {
    this.localModel.currentTab = tab;
  }

  askErasePoint(key: string) {
    this.askErasePointEvent.emit(key);
  }

  askLocatePoint(key: string) {
    this.askLocatePointEvent.emit(key);
  }

  calibrateView() {
    this.calibrateEvent.emit();
  }

  useOrbitControls() {
    this.useControlsEvent.emit();
  }

  turnReferencePoints(value: boolean) {
    this.states.seeCalibPoints = value;
  }

  turnFullscreen(value: boolean) {
    this.fullScreenEvent.emit(value);
  }

  format2DPoint(point: any) {
    if (point) {
      return `${point.x.toFixed(2)}, ${point.y.toFixed(2)}`;
    } else {
      return '-';
    }
  }

  format3DPoint(point: any) {
    if (point) {
      return `${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(
        2
      )}`;
    } else {
      return '-';
    }
  }

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
      texture: {
        width: 192,
        height: 108,
      },
    };
    this.saveEvent.emit();
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
    this.saveEvent.emit();
    this.remove3DModel.emit(key);
  }

  changedView(viewId: string) {
    this.localModel.currentView = this.mymodel.calib[viewId];
    this.changedFovEvent.emit(this.localModel.currentView.fov);
    this.changedViewEvent.emit(this.localModel.currentView);
  }

  async removeView(viewId: string) {
    const response = await this.modalService.confirm({
      title: `¿Seguro que desea borrar la vista ${this.mymodel.calib[viewId].name}?`,
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    delete this.mymodel.calib[viewId];
    this.localModel.currentView = null;
    this.localModel.currentViewName = null;
    this.saveEvent.emit();
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
      fov: 35,
    };
    if (this.localModel.currentViewName == null) {
      this.localModel.currentViewName = id;
      this.changedView(id);
    }
    this.saveEvent.emit();
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
