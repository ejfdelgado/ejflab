import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyTuples } from 'srcJs/MyTuples';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';

export interface TupleData {
  status: string;
  body?: any;
}

export interface TupleResponseDetailData {
  v: any;
  act: number;
  cre: number;
  pg: string;
  id: string;
}

export interface TupleResponseData {
  payload: Array<TupleResponseDetailData>;
}

const URL = 'srv/tup';

export class TupleServiceInstance {
  evento = new EventEmitter<TupleData>();
  model: any | null = null;
  builder: any;
  id: string;
  httpService: HttpService;
  constructor(id: string, writer: Function, httpService: HttpService) {
    this.id = id;
    this.httpService = httpService;
    this.evento = new EventEmitter<TupleData>();
    this.builder = MyTuples.getBuilder();
    this.builder.setProcesor(writer);
    this.builder.addActivityListener((status: any) => {
      if (status === true) {
        this.evento.emit({ status: 'save_wip' });
      } else if (status === false) {
        this.evento.emit({ status: 'save_done' });
      }
    });

    // Se debe suscribir a firebase en un modelo público para tomar los cambios que se ha perdido...
    // const afectado = builder2.affect(differences);
    setTimeout(() => {
      this.read();
    }, 0);
  }
  async read() {
    this.evento.emit({ status: 'read_wip' });
    const request = {
      offset: 0,
      max: 20,
      id: this.id,
    };

    let response: TupleResponseData | null = null;
    do {
      response = await this.httpService.get<TupleResponseData>(
        `${URL}?offset=${request.offset}&max=${request.max}&id=${request.id}`,
        { showIndicator: true }
      );
      if (response != null && response.payload.length > 0) {
        const tuplas = MyTuples.convertFromBD(response.payload);
        this.builder.build(tuplas);
        request.offset += response.payload.length;
      }
    } while (response != null && response.payload.length > 0);
    this.model = this.builder.end();
    this.evento.emit({ status: 'read_done', body: this.model });
  }
  save(model: any) {
    this.builder.trackDifferences(model);
  }
}

@Injectable({
  providedIn: 'root',
})
export class TupleService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private httpService: HttpService,
    public dialog: MatDialog
  ) {}

  getReader(id: string): TupleServiceInstance {
    const save = async (batch: any): Promise<any> => {
      //console.log(`Guardando ${id} con ${batch} ...`);
      await this.httpService.post(
        URL,
        {
          id: id,
          body: batch,
        },
        { showIndicator: false }
      );
      //console.log(`Guardando ${id} con ${batch} ok`);
    };
    return new TupleServiceInstance(id, save, this.httpService);
  }
}
