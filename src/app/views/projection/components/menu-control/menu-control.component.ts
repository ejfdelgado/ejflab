import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { ModalService } from 'src/services/modal.service';
import { IdGen } from 'srcJs/IdGen';
import { ModuloSonido } from 'srcJs/ModuloSonido';
import { GlobalModelData, LocalModelData } from '../../projection.component';

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

  constructor(public modalService: ModalService) {}

  ngOnInit(): void {}

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
