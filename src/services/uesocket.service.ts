import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { MyConstants } from 'srcJs/MyConstants';

export enum SocketActions {
  chatMessage = 'chatMessage',
  buscarParticipantes = 'buscarParticipantes',
  createScore = 'createScore',
  updateScore = 'updateScore',
  stateWrite = 'stateWrite',
  stateRead = 'stateRead',
  startGame = 'startGame',
  endGame = 'endGame',
  updateCode = 'updateCode',
  synchronizeFile = 'synchronizeFile',
  voice = 'voice',
  touch = 'touch',
  untouch = 'untouch',
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
  mine: boolean;
}

export interface StateReadData {
  key: string;
  mine: boolean;
}

export interface StateChangedData {
  key: string;
  val: any;
}

export interface StartGameData {}

export interface EndGameData {}

export interface UpdateCodeData {}

export interface SynchronizeFileData {
  fileName: string;
  base64: string;
}

interface ServerToClientEvents {
  chatMessage: (message: string) => void;
  personalChat: (message: string) => void;
  buscarParticipantesResponse: (message: string) => void;
  stateChanged: (message: string) => void;
  sound: (message: string) => void;
  animate: (message: string) => void;
  mute: (message: string) => void;
}

interface ClientToServerEvents {
  chatMessage: (room: string) => void;
  buscarParticipantes: (inicial: string) => void;
  createScore: (data: CreateScoreData) => void;
  updateScore: (data: UpdateScoreData) => void;
  selectScenario: (data: SelectScenarioData) => void;
  stateWrite: (data: StateWriteData) => void;
  stateRead: (data: StateReadData) => void;
  startGame: (data: StartGameData) => void;
  endGame: (data: EndGameData) => void;
  updateCode: (data: UpdateCodeData) => void;
  synchronizeFile: (data: SynchronizeFileData) => void;
  voice: (text: string) => void;
  touch: (text: string) => void;
  untouch: (text: string) => void;
}

@Injectable({
  providedIn: 'root',
})
export class UeSocketService {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    MyConstants.SRV_ROOT
  );

  constructor() {}

  static createScoreSample(): CreateScoreData {
    return {
      personId: 'CC1010166710',
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
      name: 'caso1-cooperante',
    };
  }

  static stateWriteSample(): StateWriteData {
    return {
      key: 'test',
      val: true,
      mine: false,
    };
  }

  static stateReadSample(): StateReadData {
    return {
      key: 'test',
      mine: false,
    };
  }

  static startGameSample(): StartGameData {
    return {};
  }

  static endGameSample(): EndGameData {
    return {};
  }

  static updateCodeSample(): UpdateCodeData {
    return {};
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
