import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { MyConstants } from 'srcJs/MyConstants';

export enum SocketActions {
  chatMessage = 'chatMessage',
  buscarParticipantes = 'buscarParticipantes',
  createScore = 'createScore',
  updateScore = 'updateScore',
}

export interface CreateScoreData {
  personId: string;
}

export interface UpdateScoreData {
  id: number;
  column: string;
  value: any;
}

export interface SelectScenarioData {
  name: string;
}

export interface StateWriteData {
  key: string;
  val: any;
}

export interface StateChangedData {
  key: string;
  val: any;
}

interface ServerToClientEvents {
  chatMessage: (message: string) => void;
  personalChat: (message: string) => void;
  buscarParticipantesResponse: (message: string) => void;
  stateChanged: (message: string) => void;
}

interface ClientToServerEvents {
  chatMessage: (room: string) => void;
  buscarParticipantes: (inicial: string) => void;
  createScore: (data: CreateScoreData) => void;
  updateScore: (data: UpdateScoreData) => void;
  selectScenario: (data: SelectScenarioData) => void;
  stateWrite: (data: StateWriteData) => void;
}

@Injectable({
  providedIn: 'root',
})
export class UeSocketService {
  evento: EventEmitter<any>;
  eventResponse: EventEmitter<any>;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    MyConstants.SRV_ROOT
  );

  constructor() {
    this.evento = new EventEmitter<any>();
    this.eventResponse = new EventEmitter<any>();
  }

  static createScoreSample(): CreateScoreData {
    return {
      personId: 'CC1010166710'
    };
  }

  static updateScoreSample(): UpdateScoreData {
    return {
      id: 0,
      column: 'puntaje_segundos',
      value: '300',
    };
  }

  static selectScenarioSample(): SelectScenarioData {
    return {
      name: 'barla20-cooperante',
    };
  }

  static stateWriteSample(): StateWriteData {
    return {
      key: 'test',
      val: true,
    };
  }

  on(llave: any, fun: Function) {
    this.socket.on(llave, fun);
  }

  removeListener(llave: any, fun: Function) {
    this.socket.removeListener(llave, fun);
  }

  removeAllListeners(llave: any) {
    this.socket.removeAllListeners(llave);
  }

  emit(llave: any, message: any) {
    this.socket.emit(llave, JSON.parse(message));
  }
}
