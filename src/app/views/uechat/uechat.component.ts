import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { MyConstants } from 'srcJs/MyConstants';

enum SocketActions {
  chatMessage = 'chatMessage',
  buscarParticipantes = 'buscarParticipantes',
  createScore = 'createScore',
  updateScore = 'updateScore',
}

interface CreateScoreData {
  personId: string;
  sceneId: number;
}

interface UpdateScoreData {
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

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit {
  mymessage: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    MyConstants.SRV_ROOT
  );

  constructor() {}

  ngOnInit(): void {
    this.socket.on('chatMessage', (message) => {
      this.messages.push(message);
    });
    this.socket.on('personalChat', (message) => {
      this.messages.push(message);
    });
    this.socket.on('buscarParticipantesResponse', (message) => {
      this.messages.push(message);
    });
  }

  updateSample(valor: any): void {
    const createScore: CreateScoreData = { personId: 'CC1010166710', sceneId: 1 };
    const updateScore: UpdateScoreData = { id: 0, column: 'puntaje_segundos', value: '300' };
    const MAPEO_SAMPLES: { [key: string]: string } = {
      chatMessage: '""',
      buscarParticipantes: '""',
      createScore: JSON.stringify(createScore, null, 4),
      updateScore: JSON.stringify(updateScore, null, 4),
    };
    const key: string = valor.target.value;
    const sample = MAPEO_SAMPLES[key];
    if (typeof sample == 'string') {
      this.mymessage = sample;
    }
  }

  sendMessage(): void {
    if (this.selectedAction != null) {
      this.socket.emit(this.selectedAction, JSON.parse(this.mymessage));
      this.mymessage = '';
      this.selectedAction = null;
    }
  }
}
