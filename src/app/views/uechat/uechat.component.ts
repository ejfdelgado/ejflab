import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketActions, UeSocketService } from 'src/services/uesocket.service';
import { SimpleObj } from 'srcJs/SimpleObj';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit, OnDestroy {
  binded: (message: string) => any;
  binded2: (message: string) => any;
  modelState = {};
  selectedView: string = 'chat';
  mymessage: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];

  constructor(public socketService: UeSocketService) {}

  ngOnInit(): void {
    this.binded = this.receiveChatMessage.bind(this);
    this.binded2 = this.receiveStateChanged.bind(this);
    this.socketService.on('chatMessage', this.binded);
    this.socketService.on('personalChat', this.binded);
    this.socketService.on('buscarParticipantesResponse', this.binded);
    this.socketService.on('stateChanged', this.binded2);
  }

  ngOnDestroy(): void {
    this.socketService.removeListener('chatMessage', this.binded);
    this.socketService.removeListener('personalChat', this.binded);
    this.socketService.removeListener(
      'buscarParticipantesResponse',
      this.binded
    );
    this.socketService.removeListener('stateChanged', this.binded2);
  }

  selectView(viewName: string) {
    this.selectedView = viewName;
  }

  receiveStateChanged(content: string) {
    const parsed = JSON.parse(content);
    if (parsed.key == '') {
      this.modelState = parsed.val;
    } else {
      // Se escribe solo el punto que dice key
      this.modelState = SimpleObj.recreate(this.modelState, parsed.key, parsed.val);
    }
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
    const MAPEO_SAMPLES: { [key: string]: string } = {
      chatMessage: '""',
      buscarParticipantes: '""',
      createScore: JSON.stringify(UeSocketService.createScoreSample(), null, 4),
      updateScore: JSON.stringify(UeSocketService.updateScoreSample(), null, 4),
      selectScenario: JSON.stringify(
        UeSocketService.selectScenarioSample(),
        null,
        4
      ),
      stateWrite: JSON.stringify(UeSocketService.stateWriteSample(), null, 4),
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
