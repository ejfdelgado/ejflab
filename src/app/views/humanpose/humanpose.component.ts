import { Component, OnInit, ViewChild } from '@angular/core';
import { ElementItemData } from 'src/app/mycommon/components/scrollfiles/scrollfiles.component';
import { ScrollnavComponent } from 'src/app/mycommon/components/scrollnav/scrollnav.component';
import { OptionData } from 'src/app/mycommon/components/statusbar/statusbar.component';

export interface HumanPoseLocalModel {
  archivos: Array<ElementItemData>;
  timeline: Array<any>;
}

@Component({
  selector: 'app-humanpose',
  templateUrl: './humanpose.component.html',
  styleUrls: ['./humanpose.component.css'],
})
export class HumanposeComponent implements OnInit {
  model: HumanPoseLocalModel = {
    archivos: [],
    timeline: [],
  };
  @ViewChild('myScrollNav')
  scrollNav: ScrollnavComponent;
  public extraOptions: Array<OptionData> = [];
  public currentView: string = 'threejs';

  constructor() {
    this.extraOptions.push({
      action: () => {
        this.setView('threejs');
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
  }

  setView(type: string) {
    this.currentView = type;
  }

  async loadData() {
    this.model.archivos = [];
  }

  async uploadFile() {
    const nuevoArchivo: ElementItemData = {
      name: 'Archivo2.csv',
      url: '/ruta/a/archivo2.csv',
      date: new Date().getTime(),
      checked: false,
    };
    this.model.archivos.push(nuevoArchivo);
  }

  async deleteFile(oneFile: ElementItemData) {
    // TODO ask confirm
    const index = this.model.archivos.indexOf(oneFile);
    if (index >= 0) {
      this.model.archivos.splice(index, 1);
    }
  }

  async saveAll() {
    console.log('TODO saveAll');
  }

  async showPose(row: any) {
    console.log(`Ask to show in 3d renderer ${JSON.stringify(row)}`);
  }

  async openFile(oneFile: ElementItemData) {
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

  ngOnInit(): void {}
}
