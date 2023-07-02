import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyTuples } from 'srcJs/MyTuples';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';
import {
  Firestore,
  collectionData,
  collection,
  query,
  where,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BackendPageService } from './backendPage.service';
import { ModuloDatoSeguroFront } from 'srcJs/ModuloDatoSeguroFront';

export interface TupleTempData {
  pg: string;
  body?: any;
  cifrado?: string;
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

export class TupleServiceInstance {
  evento = new EventEmitter<TupleData>();
  model: any | null = null;
  builder: any;
  myLiveChanges: any;
  constructor(
    private id: string,
    private writer: Function,
    private httpService: HttpService,
    private firestore: Firestore,
    private backendPageService: BackendPageService
  ) {
    this.myLiveChanges = {};
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
        let lastMaxTime = 0;
        const checkNews = (cutTime: number, label: string) => {
          lastMaxTime = cutTime;
          //console.log(`checkNews ${label} cutTime:${cutTime}`);
          const myCollection = collection(firestore, 'pro-tuple-temp');
          const consulta = query(
            myCollection,
            where('pg', '==', this.id),
            where('t', '>', cutTime)
          );

          let changes: Observable<DocumentData[]> = collectionData(consulta);

          const secondSubscription = changes.subscribe(
            async (data: Array<any>) => {
              if (data.length > 0) {
                let llaves = null;
                secondSubscription.unsubscribe();
                for (let i = 0; i < data.length; i++) {
                  const actual: TupleTempData = data[i];
                  const llave = `${actual.t}-${actual.who}`;
                  if (!(llave in this.myLiveChanges)) {
                    if (!actual.body) {
                      // Se asume cifrado
                      if (llaves == null) {
                        llaves = await backendPageService.getPageKeys();
                      }
                      actual.body =
                        ModuloDatoSeguroFront.decifrarConListaDeLlaves(
                          actual.cifrado,
                          llaves
                        );
                    }
                    if (actual.body) {
                      actual.body.t = actual.t;
                      this.myLiveChanges[llave] = actual.body;
                    }
                  }
                  if (actual.t > maxTime) {
                    maxTime = actual.t;
                  }
                }
                this.applyNewChanges();
                checkNews(maxTime, 'inside');
              }
            }
          );
        };
        checkNews(evento.t, 'outside');
      }
    });

    setTimeout(() => {
      this.read();
    }, 0);
  }

  setBlackKeyPatterns(lista: Array<any>) {
    this.builder.setBlackKeyPatterns(lista);
  }

  fastMapListenerKeys: Array<string> = [];
  mapListener: { [key: string]: Array<Function> } = {};
  addListener(key: string, callback: Function) {
    if (!(key in this.mapListener)) {
      this.mapListener[key] = [];
    }
    const indice = this.mapListener[key].indexOf(callback);
    if (indice < 0) {
      this.mapListener[key].push(callback);
    }
    this.fastMapListenerKeys = Object.keys(this.mapListener);
  }

  removeListener(key: string, callback?: Function) {
    if (!(key in this.mapListener)) {
      return;
    }
    if (callback) {
      const indice = this.mapListener[key].indexOf(callback);
      if (indice >= 0) {
        this.mapListener[key].splice(indice, 1);
        if (this.mapListener[key].length == 0) {
          delete this.mapListener[key];
        }
      }
    } else {
      delete this.mapListener[key];
    }
    this.fastMapListenerKeys = Object.keys(this.mapListener);
  }

  removeAllListener() {
    this.mapListener = {};
  }

  notifyObservers(someKey: string, someValue: any) {
    const arreglo = this.mapListener[someKey];
    for (let j = 0; j < arreglo.length; j++) {
      const someFun = arreglo[j];
      someFun(someKey, someValue);
    }
  }

  applyNewChanges() {
    if (this.model == null) {
      return;
    }
    const notifyObserversThis = this.notifyObservers.bind(this);
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
    let changeCount = 0;
    for (let i = 0; i < lista.length; i++) {
      const differences = lista[i];
      if (!this.builder.isOwnChange(differences)) {
        this.model = this.builder.affect(
          differences,
          this.fastMapListenerKeys,
          notifyObserversThis
        );
        changeCount++;
      }
    }
    if (changeCount > 0) {
      this.evento.emit({ status: 'news', body: this.model });
    }
    this.myLiveChanges = {};
  }

  async read() {
    this.evento.emit({ status: 'read_wip' });
    const request = {
      offset: 0,
      max: 60,
      id: this.id,
    };

    let response: TupleResponseData | null = null;
    do {
      response = await this.httpService.get<TupleResponseData>(
        `srv/${request.id}/tup?offset=${request.offset}&max=${request.max}`,
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
    const notifyObserversThis = this.notifyObservers.bind(this);
    this.builder.trackDifferences(
      model,
      this.fastMapListenerKeys,
      notifyObserversThis
    );
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
    private firestore: Firestore,
    private backendPageService: BackendPageService
  ) {}

  getReader(pageId: string): TupleServiceInstance {
    const writer = async (batch: any): Promise<any> => {
      //console.log(`Guardando ${pageId} con ${batch} ...`);
      await this.httpService.post(
        `srv/${pageId}/tup`,
        {
          body: batch,
          live: '1',
          secret: '1',
        },
        { showIndicator: false }
      );
      //console.log(`Guardando ${pageId} con ${batch} ok`);
    };
    return new TupleServiceInstance(
      pageId,
      writer,
      this.httpService,
      this.firestore,
      this.backendPageService
    );
  }
}
