import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  ElementItemData,
  ElementPairItemData,
} from 'src/app/mycommon/components/scrollfile/scrollfile.component';
import { ScrollFilesActionData } from 'src/app/mycommon/components/scrollfiles/scrollfiles.component';
import { ScrollnavComponent } from 'src/app/mycommon/components/scrollnav/scrollnav.component';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';
import { MyTensorflowData } from 'src/app/mycommon/components/tensorflow/tensorflow.component';
import { ThreejsComponent } from 'src/app/mycommon/components/threejs/threejs.component';
import { ModalService } from 'src/services/modal.service';
import { IdGen } from 'srcJs/IdGen';

export interface HumanPoseLocalModel {
  archivosCsv: { [key: string]: ElementItemData };
  archivosTensorflow: { [key: string]: ElementItemData };
  timeline: Array<any>;
  tensorflow: MyTensorflowData;
}

@Component({
  selector: 'app-humanpose',
  templateUrl: './humanpose.component.html',
  styleUrls: ['./humanpose.component.css'],
})
export class HumanposeComponent implements OnInit {
  localTitle: string = 'Entrenamiento para calificar movimientos';
  @ViewChild('three_ref') threeRef: ElementRef;
  model: HumanPoseLocalModel = {
    archivosCsv: {},
    archivosTensorflow: {},
    timeline: [],
    tensorflow: {
      in: [
        {
          column: 'pink',
          min: 0,
          max: 1,
        },
        {
          column: 'small',
          min: 0,
          max: 1,
        },
      ],
      out: {
        column: 'quality',
        min: 0,
        max: 1,
        ngroups: 2,
      },
      layers: [
        {
          units: 3,
          activation: 'relu',
        },
      ],
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
  @ViewChild('myScrollNav')
  scrollNav: ScrollnavComponent;
  public extraOptions: Array<OptionData> = [];
  public scrollFiles1Actions: Array<ScrollFilesActionData> = [];
  public scrollFiles2Actions: Array<ScrollFilesActionData> = [];
  public currentView: string = 'tensorflow';
  public listedFiles: string = 'csv';

  constructor(private modalSrv: ModalService) {
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
      label: 'Agregar',
    });
    this.scrollFiles2Actions.push({
      callback: this.saveAll.bind(this),
      icon: 'save',
      label: 'Guardar',
    });
  }

  setView(type: string) {
    this.currentView = type;
  }

  async loadData() {
    this.model.archivosCsv = {};
  }

  async uploadCsvFile() {
    const nuevoArchivo: ElementItemData = {
      name: 'Archivo2.csv',
      url: '/ruta/a/archivo2.csv',
      date: new Date().getTime(),
      checked: false,
    };
    const id = await IdGen.nuevo();
    if (typeof id == 'string') {
      this.model.archivosCsv[id] = nuevoArchivo;
    }
  }

  async addTensorflowModel() {
    const nuevoArchivo: ElementItemData = {
      name: 'Archivo2.csv',
      url: '/ruta/a/archivo2.csv',
      date: new Date().getTime(),
      checked: false,
    };
    const id = await IdGen.nuevo();
    if (typeof id == 'string') {
      this.model.archivosTensorflow[id] = nuevoArchivo;
    }
  }

  async deleteCsvFile(pair: ElementPairItemData) {
    const response = await this.modalSrv.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    if (pair.key in this.model.archivosCsv) {
      delete this.model.archivosCsv[pair.key];
    }
  }

  async deleteTensorflowFile(pair: ElementPairItemData) {
    const response = await this.modalSrv.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    if (pair.key in this.model.archivosCsv) {
      delete this.model.archivosCsv[pair.key];
    }
  }

  async saveAll() {
    console.log('TODO saveAll');
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
    console.log('TODO');
  }

  showFiles(key: string) {
    this.listedFiles = key;
  }

  ngOnInit(): void {}
}
