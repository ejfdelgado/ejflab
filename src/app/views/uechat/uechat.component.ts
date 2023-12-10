import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { faTemperature3 } from '@fortawesome/free-solid-svg-icons';
import { SocketActions, UeSocketService } from 'src/services/uesocket.service';
import { SimpleObj } from 'srcJs/SimpleObj';

@Component({
  selector: 'app-uechat',
  templateUrl: './uechat.component.html',
  styleUrls: ['./uechat.component.css'],
})
export class UechatComponent implements OnInit, OnDestroy {
  @ViewChild('mySvg') mySvgRef: ElementRef;
  graphHtml: string = '';
  modelState: any = {};
  selectedView: string = 'chat';
  mymessage: string = '';
  selectedAction: SocketActions | null = null;
  messages: Array<String> = [];

  constructor(
    public socketService: UeSocketService,
    public cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.socketService.on('chatMessage', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('personalChat', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('buscarParticipantesResponse', (content: string) => {
      this.receiveChatMessage('chatMessage', content);
    });
    this.socketService.on('stateChanged', (content: string) => {
      this.receiveStateChanged('stateChanged', content);
    });
  }

  ngOnDestroy(): void {
    this.socketService.removeAllListeners('chatMessage');
    this.socketService.removeAllListeners('personalChat');
    this.socketService.removeAllListeners('buscarParticipantesResponse');
    this.socketService.removeAllListeners('stateChanged');
  }

  selectView(viewName: string) {
    this.selectedView = viewName;
  }

  getGraph(): any {
    const grafo = this.modelState['f1'];
    let svgContent = '';
    const style = 'fill:rgb(255,255,255);stroke-width:1;stroke:rgb(0,0,0)';
    if (grafo) {
      const shapes = grafo.shapes;
      if (shapes instanceof Array) {
        for (let i = 0; i < shapes.length; i++) {
          const shape = shapes[i];
          const pos = shape.pos;
          if (shape.type == 'box') {
            svgContent += `<rect rx="5" x="${pos.x}" y="${pos.y}" width="${pos.width}" height="${pos.height}" style="${style}"></rect>`;
          } else if (shape.type == 'ellipse') {
            svgContent += `<ellipse cx="${pos.x + pos.width * 0.5}" cy="${
              pos.y + pos.height * 0.5
            }" rx="${pos.width * 0.5}" ry="${
              pos.height * 0.5
            }" style="${style}"></ellipse>`;
          } else if (shape.type == 'rhombus') {
            svgContent += `<polygon points="`;
            svgContent += `${pos.x.toFixed(0)},${pos.y + pos.height * 0.5} `;
            svgContent += `${pos.x + pos.width * 0.5},${pos.y.toFixed(0)} `;
            svgContent += `${(pos.x + pos.width).toFixed(0)},${
              pos.y + pos.height * 0.5
            } `;
            svgContent += `${pos.x + pos.width * 0.5},${(
              pos.y + pos.height
            ).toFixed(0)}" `;
            svgContent += `style="${style}"/>`;
          }
          if (typeof shape.txt == 'string') {
            const lines = shape.txt.split(/\n/g);
            const lineHeight = 15;
            for (let j = 0; j < lines.length; j++) {
              const line = lines[j];
              svgContent += `<text font-family="Helvetica" font-size="13px" text-anchor="middle" x="${
                pos.x + pos.width * 0.5
              }" y="${
                pos.y +
                pos.height * 0.5 +
                j * lineHeight -
                (lines.length - 1) * lineHeight * 0.5 +
                lineHeight * 0.25
              }" fill="black">${line}</text>`;
            }
          }
        }
      }
    }
    this.graphRecomputeBoundingBox();
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  graphRecomputeBoundingBox() {
    setTimeout(() => {
      if (this.mySvgRef) {
        const svg = this.mySvgRef.nativeElement;
        var bbox = svg.getBBox();
        // Update the width and height using the size of the contents
        svg.setAttribute('width', bbox.x + bbox.width + bbox.x);
        svg.setAttribute('height', bbox.y + bbox.height + bbox.y);
      }
    });
    return true;
  }

  receiveStateChanged(key: string, content: string) {
    console.log(`[${key}]`);
    const parsed = JSON.parse(content);
    if (parsed.key == '') {
      this.modelState = parsed.val;
    } else {
      // Se escribe solo el punto que dice key
      this.modelState = Object.assign(
        {},
        SimpleObj.recreate(this.modelState, parsed.key, parsed.val)
      );
    }

    this.graphHtml = this.getGraph();
  }

  receiveChatMessage(key: string, message: any) {
    console.log(`[${key}]`);
    this.messages.push(`[${key}] ` + UechatComponent.beatyfull(message));
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
