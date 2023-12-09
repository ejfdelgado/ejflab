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
  sceneId: number;
}

export interface UpdateScoreData {
  id: number;
  column: string;
  value: any;
}

interface ServerToClientEvents {
  chatMessage: (message: string) => void;
  personalChat: (message: string) => void;
  buscarParticipantesResponse: (message: string) => void;
}

interface ClientToServerEvents {
  chatMessage: (room: string) => void;
  buscarParticipantes: (inicial: string) => void;
  createScore: (data: CreateScoreData) => void;
  updateScore: (data: UpdateScoreData) => void;
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

  on(llave: any, fun: Function) {
    this.socket.on(llave, fun);
  }

  removeListener(llave: any, fun: Function) {
    this.socket.removeListener(llave, fun);
  }

  emit(llave: any, message: any) {
    this.socket.emit(llave, JSON.parse(message));
  }
}
