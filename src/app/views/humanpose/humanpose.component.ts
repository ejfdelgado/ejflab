import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ElementItemData,
  ElementPairItemData,
} from 'src/app/mycommon/components/scrollfile/scrollfile.component';
import { ScrollFilesActionData } from 'src/app/mycommon/components/scrollfiles/scrollfiles.component';
import { ScrollnavComponent } from 'src/app/mycommon/components/scrollnav/scrollnav.component';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';
import {
  MyTensorflowData,
  MyTensorflowDataData,
} from 'src/app/mycommon/components/tensorflow/tensorflow.component';
import { ThreejsComponent } from 'src/app/mycommon/components/threejs/threejs.component';
import { ModalService } from 'src/services/modal.service';
import { IdGen } from 'srcJs/IdGen';
import { BaseComponent } from 'src/app/components/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { BackendPageService } from 'src/services/backendPage.service';
import { AuthService } from 'src/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TupleService } from 'src/services/tuple.service';
import { FileResponseData, FileService } from 'src/services/file.service';
import { WebcamService } from 'src/services/webcam.service';
import { LoginService } from 'src/services/login.service';
import { IndicatorService } from 'src/services/indicator.service';

type VIEW_OPTIONS = 'prejson' | 'threejs' | 'tensorflow';
type FILE_VIEW_OPTIONS = 'csv' | 'tensorflow';
type TENSORFLOW_DETAIL_VIEW_OPTIONS = 'configuration' | 'training' | 'data';

export interface HumanPoseLocalModel {
  //archivosCsv: { [key: string]: ElementItemData };
  //data: MyTensorflowDataData;
  //tensorflow: MyTensorflowData | null;
  //archivosTensorflow: { [key: string]: ElementItemData };
  timeline: Array<any>;
}

@Component({
  selector: 'app-humanpose',
  templateUrl: './humanpose.component.html',
  styleUrls: ['./humanpose.component.css'],
})
export class HumanposeComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  localTitle: string = 'Entrenamiento para calificar movimientos';
  @ViewChild('three_ref') threeRef: ElementRef;
  neuralNetworkModel: MyTensorflowData | null = null;
  model: HumanPoseLocalModel = {
    timeline: [],
  };
  @ViewChild('myScrollNav')
  scrollNav: ScrollnavComponent;
  public extraOptions: Array<OptionData> = [];
  public scrollFiles1Actions: Array<ScrollFilesActionData> = [];
  public scrollFiles2Actions: Array<ScrollFilesActionData> = [];
  public listedFiles: FILE_VIEW_OPTIONS = 'csv';
  public currentView: VIEW_OPTIONS = 'tensorflow';
  public tensorflowDetail: TENSORFLOW_DETAIL_VIEW_OPTIONS = 'data';

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
    public loginSrv: LoginService,
    //
    private indicator: IndicatorService
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
    this.extraOptions.push({
      action: () => {
        this.setView('threejs');
        setTimeout(() => {
          if (this.threeRef) {
            console.log(this.threeRef);
            (this.threeRef as unknown as ThreejsComponent).onResize(null);
          }
        }, 0);
      },
      icon: 'directions_run',
      label: 'Espacio 3D',
    });
    this.extraOptions.push({
      action: () => {
        this.setView('tensorflow');
      },
      icon: 'psychology',
      label: 'Red Neuronal',
    });
    this.extraOptions.push({
      action: () => {
        this.setView('prejson');
      },
      icon: 'bug_report',
      label: 'Debug',
    });
    this.scrollFiles1Actions.push({
      callback: this.uploadCsvFile.bind(this),
      icon: 'upload_file',
      label: 'Subir CSV',
    });
    this.scrollFiles1Actions.push({
      callback: this.saveAll.bind(this),
      icon: 'save',
      label: 'Guardar',
    });
    this.scrollFiles2Actions.push({
      callback: this.addTensorflowModel.bind(this),
      icon: 'add',
      label: 'Agregar Red',
    });
    this.scrollFiles2Actions.push({
      callback: this.saveAll.bind(this),
      icon: 'save',
      label: 'Guardar',
    });
  }

  override onTupleReadDone() {
    if (!this.tupleModel.data) {
      this.tupleModel.data = {
        in: [],
        out: {
          column: '',
          min: 0,
          max: 1,
          ngroups: 0,
        },
      };
    }
    super.onTupleReadDone();
  }

  override onTupleWriteDone() {
    console.log('Writed OK!');
  }

  setView(type: VIEW_OPTIONS) {
    this.currentView = type;
  }

  async uploadCsvFile() {
    const processFileThis = this.processFile.bind(this);
    this.fileService.sendRequest(
      { type: 'file', mimeType: 'text/plain, text/csv' },
      processFileThis
    );
  }

  async processFile(responseData: FileResponseData) {
    const wait = this.indicator.start();
    try {
      const id = await IdGen.nuevo();
      if (typeof id == 'string') {
        const nuevoArchivo: ElementItemData = {
          name: responseData.fileName,
          date: new Date().getTime(),
          checked: false,
          url: '',
        };
        const response = await this.saveFile({
          base64: responseData.base64,
          fileName: `${id}/${responseData.fileName}`,
        });
        nuevoArchivo.url = response.key;
        if (!('archivosCsv' in this.tupleModel)) {
          this.tupleModel.archivosCsv = {};
        }
        this.tupleModel.archivosCsv[id] = nuevoArchivo;
      }
    } catch (err) {}
    wait.done();
  }

  async addTensorflowModel() {
    const id = await IdGen.nuevo();
    if (!('archivosTensorflow' in this.tupleModel)) {
      this.tupleModel.archivosTensorflow = {};
    }
    const nuevoArchivo: ElementItemData = {
      name: `Red ${id}`,
      url: '',
      date: new Date().getTime(),
      checked: false,
      otherData: {
        layers: [],
        compile: {
          loss: 'binaryCrossentropy',
          metrics: ['accuracy'],
        },
        fit: {
          shuffle: true,
          epochs: 20,
          validationSplit: 0.1,
        },
      },
    };

    if (typeof id == 'string') {
      this.tupleModel.archivosTensorflow[id] = nuevoArchivo;
    }
  }

  async deleteCsvFile(pair: ElementPairItemData) {
    const response = await this.modalService.confirm({
      title: `¿Seguro que desea borrar ${pair.value.name}?`,
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    if (pair.key in this.tupleModel.archivosCsv) {
      await this.fileService.delete(pair.value.url);
      delete this.tupleModel.archivosCsv[pair.key];
    }
  }

  async deleteTensorflowFile(pair: ElementPairItemData) {
    const response = await this.modalService.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    if (pair.key in this.tupleModel.archivosTensorflow) {
      delete this.tupleModel.archivosTensorflow[pair.key];
    }
  }

  async saveAll() {
    this.saveTuple();
  }

  async showPose(row: any) {
    console.log(`Ask to show in 3d renderer ${JSON.stringify(row)}`);
  }

  async openCsvFile(oneFile: ElementPairItemData) {
    this.model.timeline = [
      { d1: 1, d2: 4, out: 2 },
      { d1: 2, d2: 4, out: 0 },
      { d1: 1, d2: 4, out: 1 },
    ];
    setTimeout(() => {
      this.scrollNav.computeDimensions();
      this.scrollNav.computeWindow();
      this.scrollNav.detectChanges();
    }, 0);
  }

  async openTensorflowFile(oneFile: ElementPairItemData) {
    const otherData = oneFile.value.otherData as MyTensorflowData;
    this.neuralNetworkModel = otherData;
  }

  showFiles(key: FILE_VIEW_OPTIONS) {
    this.listedFiles = key;
  }

  showTensorflowDetail(key: TENSORFLOW_DETAIL_VIEW_OPTIONS) {
    this.tensorflowDetail = key;
  }

  override async ngOnInit() {
    await super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
