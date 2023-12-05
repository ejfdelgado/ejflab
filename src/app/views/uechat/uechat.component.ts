import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { MyConstants } from 'srcJs/MyConstants';

interface ServerToClientEvents {
  chatMessage: (message: string) => void;
  buscarParticipantesResponse: (message: string) => void;
}

interface ClientToServerEvents {
  chatMessage: (room: string) => void;
  buscarParticipantes: (inicial: string) => void;
}

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit {
  mymessage: string = '';
  messages: Array<String> = [];
  socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    MyConstants.SRV_ROOT
  );

  constructor() {}

  ngOnInit(): void {
    this.socket.on('chatMessage', (message) => {
      this.messages.push(message);
    });
    this.socket.on('buscarParticipantesResponse', (message) => {
      this.messages.push(message);
    });
  }

  sendMessage(): void {
    const patrones = [/^buscar_participantes_(.+)/];
    if (patrones[0].test(this.mymessage)) {
      const partes = patrones[0].exec(this.mymessage);
      if (partes != null) {
        this.socket.emit('buscarParticipantes', partes[1]);
      }
    } else {
      this.socket.emit('chatMessage', this.mymessage);
    }
    this.mymessage = '';
  }
}
