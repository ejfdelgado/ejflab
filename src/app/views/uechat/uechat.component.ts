import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CreateScoreData,
  SocketActions,
  UeSocketService,
  UpdateScoreData,
} from 'src/services/uesocket.service';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit, OnDestroy {
  binded: (message: string) => any;
  mymessage: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];

  constructor(public socketService: UeSocketService) {}

  ngOnInit(): void {
    this.binded = this.receiveChatMessage.bind(this);
    this.socketService.on('chatMessage', this.binded);
    this.socketService.on('personalChat', this.binded);
    this.socketService.on('buscarParticipantesResponse', this.binded);
  }

  ngOnDestroy(): void {
    this.socketService.removeListener('chatMessage', this.binded);
    this.socketService.removeListener('personalChat', this.binded);
    this.socketService.removeListener(
      'buscarParticipantesResponse',
      this.binded
    );
  }

  receiveChatMessage(message: any) {
    this.messages.push(UechatComponent.beatyfull(message));
  }

  static beatyfull(texto: string) {
    try {
      return JSON.stringify(JSON.parse(texto), null, 4);
    } catch (err) {
      return texto;
    }
  }

  updateSample(valor: any): void {
    const createScore: CreateScoreData = {
      personId: 'CC1010166710',
      sceneId: 1,
    };
    const updateScore: UpdateScoreData = {
      id: 0,
      column: 'puntaje_segundos',
      value: '300',
    };
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
      this.socketService.emit(this.selectedAction, this.mymessage);
      this.mymessage = '';
      this.selectedAction = null;
    }
  }
}
