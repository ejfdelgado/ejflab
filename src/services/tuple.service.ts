import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyTuples } from 'srcJs/MyTuples';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';
import {
  Firestore,
  collectionData,
  collectionChanges,
  collectionSnapshots,
  collection,
  query,
  where,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface TupleTempData {
  pg: string;
  body?: any;
  t: number;
  who: string;
}

export interface TupleData {
  status: string;
  body?: any;
  t?: number;
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
  t: number;
}

const URL = 'srv/tup';

export class TupleServiceInstance {
  evento = new EventEmitter<TupleData>();
  model: any | null = null;
  builder: any;
  id: string;
  httpService: HttpService;
  myLiveChanges: any;
  constructor(
    id: string,
    writer: Function,
    httpService: HttpService,
    firestore: Firestore
  ) {
    this.myLiveChanges = {};
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
    // https://firebase.google.com/docs/firestore/query-data/queries?hl=es-419
    const subscription = this.evento.subscribe((evento) => {
      if (evento.status == 'read_first' && evento.t) {
        subscription.unsubscribe();
        let maxTime = evento.t;
        const checkNews = (cutTime: number) => {
          //console.log(`checkNews cutTime:${cutTime}`);
          const myCollection = collection(firestore, 'pro-tuple-temp');
          const consulta = query(
            myCollection,
            where('pg', '==', this.id),
            where('t', '>', cutTime)
          );

          let changes: Observable<DocumentData[]> = collectionData(consulta);

          const secondSubscription = changes.subscribe((data: Array<any>) => {
            if (data.length > 0) {
              secondSubscription.unsubscribe();
              for (let i = 0; i < data.length; i++) {
                const actual: TupleTempData = data[i];
                const llave = `${actual.t}-${actual.who}`;
                if (!(llave in this.myLiveChanges)) {
                  actual.body.t = actual.t;
                  if (actual.t > maxTime) {
                    maxTime = actual.t;
                  }
                  this.myLiveChanges[llave] = actual.body;
                }
              }
              this.applyNewChanges();
              checkNews(maxTime);
            }
          });
        };
        checkNews(evento.t);
      }
    });

    setTimeout(() => {
      this.read();
    }, 0);
  }

  applyNewChanges() {
    if (this.model == null) {
      return;
    }
    // Convertir el modelo en una lista ordenada de lo más viejo a lo más nuevo
    const lista = [];
    const llaves = Object.keys(this.myLiveChanges);
    if (llaves.length == 0) {
      return;
    }
    for (let i = 0; i < llaves.length; i++) {
      const llave = llaves[i];
      const actual = this.myLiveChanges[llave];
      lista.push(actual);
    }
    lista.sort((a: any, b: any): number => {
      const resta = a.t - b.t;
      return resta;
    });
    for (let i = 0; i < lista.length; i++) {
      const differences = lista[i];
      this.model = this.builder.affect(differences);
    }
    this.evento.emit({ status: 'news', body: this.model });
    this.myLiveChanges = {};
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
      if (request.offset == 0 && response != null) {
        this.evento.emit({ status: 'read_first', t: response.t });
      }
      if (response != null && response.payload.length > 0) {
        const tuplas = MyTuples.convertFromBD(response.payload);
        this.builder.build(tuplas);
        request.offset += response.payload.length;
      }
    } while (response != null && response.payload.length > 0);
    this.model = this.builder.end();
    this.applyNewChanges();
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
    public dialog: MatDialog,
    private firestore: Firestore
  ) {}

  getReader(id: string): TupleServiceInstance {
    const save = async (batch: any): Promise<any> => {
      //console.log(`Guardando ${id} con ${batch} ...`);
      await this.httpService.post(
        URL,
        {
          id: id,
          body: batch,
          live: '1',
        },
        { showIndicator: false }
      );
      //console.log(`Guardando ${id} con ${batch} ok`);
    };
    return new TupleServiceInstance(id, save, this.httpService, this.firestore);
  }
}
