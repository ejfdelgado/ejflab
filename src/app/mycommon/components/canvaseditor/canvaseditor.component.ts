import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { map, Observable, of } from 'rxjs';
import { FileRequestData, FileService } from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';

export interface CanvasOptionsData {
  width: number;
  height: number;
  useRoot?: string;
}

export interface StrokeOptionsData {
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  strokeStyle?: string;
  lineWidth?: number;
}

export interface StrokeOptionsMenuData {
  txt: string;
  icon: string;
  option: StrokeOptionsData;
}

export interface ImagesUrlData {
  sketch?: string;
  actor?: string;
  background?: string;
}

export interface ImagesChangedData {
  sketch?: boolean;
  actor?: boolean;
  background?: boolean;
}

@Component({
  selector: 'app-canvaseditor',
  templateUrl: './canvaseditor.component.html',
  styleUrls: ['./canvaseditor.component.css'],
})
export class CanvaseditorComponent implements OnInit, OnChanges {
  @Input() options: CanvasOptionsData;
  @Input() defaultFileName: ImagesUrlData;
  @Input() defaultUrl: ImagesUrlData;
  @Input() url: ImagesUrlData | undefined;
  @Output() urlChange = new EventEmitter<ImagesUrlData>();

  @ViewChild('eventsContainer') eventsContainerRef: ElementRef;

  @ViewChild('canvas') canvasRef: ElementRef;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D | null;

  @ViewChild('canvasGreen') canvasGreenRef: ElementRef;
  private canvasGreen: HTMLCanvasElement;
  private contextGreen: CanvasRenderingContext2D | null;

  @ViewChild('canvasBackground') canvasBackgroundRef: ElementRef;
  private canvasBackground: HTMLCanvasElement;
  private contextBackground: CanvasRenderingContext2D | null;

  private paint: boolean;

  private clickX: number[] = [];
  private clickY: number[] = [];
  private clickDrag: boolean[] = [];

  private changes: ImagesChangedData = {
    actor: false,
    background: false,
    sketch: false,
  };

  menuSize: Array<StrokeOptionsMenuData> = [
    {
      txt: 'Pequeño',
      option: { lineWidth: 1 },
      icon: 'looks_one',
    },
    {
      txt: 'Mediano',
      option: { lineWidth: 10 },
      icon: 'looks_two',
    },
    {
      txt: 'Grande',
      option: { lineWidth: 20 },
      icon: 'looks_3',
    },
  ];

  menuColors: Array<StrokeOptionsMenuData> = [
    {
      txt: 'Negro',
      option: { strokeStyle: '#000000' },
      icon: 'radio_button_checked',
    },
    {
      txt: 'Amarillo',
      option: { strokeStyle: '#FCFF26' },
      icon: 'radio_button_checked',
    },
    {
      txt: 'Azul',
      option: { strokeStyle: '#265BFF' },
      icon: 'radio_button_checked',
    },
    {
      txt: 'Rojo',
      option: { strokeStyle: '#FF2626' },
      icon: 'radio_button_checked',
    },
    {
      txt: 'Verde',
      option: { strokeStyle: '#26FF26' },
      icon: 'radio_button_checked',
    },
    {
      txt: 'Blanco',
      option: { strokeStyle: '#FFFFFF' },
      icon: 'radio_button_checked',
    },
  ];

  lastStrokeColor: StrokeOptionsData;
  lastStrokeSize: StrokeOptionsData;
  lastTool: string;

  constructor(
    private modalSrv: ModalService,
    public fileService: FileService,
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer
  ) {
    this.lastStrokeColor = this.menuColors[0].option;
    this.lastStrokeSize = this.menuSize[0].option;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.canvas = this.canvasRef.nativeElement;
      this.canvas.width = this.options.width;
      this.canvas.height = this.options.height;
      this.context = this.canvas.getContext('2d');

      this.canvasGreen = this.canvasGreenRef.nativeElement;
      this.canvasGreen.width = this.options.width;
      this.canvasGreen.height = this.options.height;
      this.contextGreen = this.canvasGreen.getContext('2d');

      this.canvasBackground = this.canvasBackgroundRef.nativeElement;
      this.canvasBackground.width = this.options.width;
      this.canvasBackground.height = this.options.height;
      this.contextBackground = this.canvasBackground.getContext('2d');

      if (!this.context) {
        return;
      }

      this.setStrokeOptions({
        lineCap: 'round',
        lineJoin: 'round',
      });

      this.lastTool = 'lapiz';
      this.setStrokeOptions(this.menuSize[0].option);
      this.setStrokeOptions(this.lastStrokeColor);

      this.redraw();
      this.createUserEvents();
    }, 0);
  }

  noPropagar(e: any) {
    e.stopPropagation();
    e.preventDefault();
  }

  async askForImage(type: string) {
    const options: FileRequestData = {
      type: 'photo',
    };
    this.fileService.sendRequest(options, async (response: any) => {
      await this.localLoadImages(response.base64, type);
      if (type == 'actor') {
        this.changes.actor = true;
      } else if (type == 'background') {
        this.changes.background = true;
      }
    });
  }

  drawImageScaled(img: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    let canvas = ctx.canvas;
    let hRatio = canvas.width / img.width;
    let vRatio = canvas.height / img.height;
    let ratio = Math.max(hRatio, vRatio);
    let centerShift_x = (canvas.width - img.width * ratio) / 2;
    let centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  }

  async localLoadImages(url: string, type: string) {
    return new Promise<void>((resolve, reject) => {
      this.loadImage(url).subscribe((url: string) => {
        try {
          const newImg = document.createElement('img');
          newImg.onload = () => {
            if (type == 'sketch' && this.context) {
              this.drawImageScaled(newImg, this.context);
            } else if (type == 'actor' && this.contextGreen) {
              this.drawImageScaled(newImg, this.contextGreen);
            } else if (type == 'background' && this.contextBackground) {
              this.drawImageScaled(newImg, this.contextBackground);
            }
            resolve();
          };
          newImg.src = url;
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  ngOnChanges(changes: any) {
    if (changes.url && changes.url.currentValue) {
      const actual: ImagesUrlData = changes.url.currentValue;
      if (actual.sketch) {
        this.localLoadImages(actual.sketch, 'sketch');
      }
      if (actual.actor) {
        this.localLoadImages(actual.actor, 'actor');
      }
      if (actual.background) {
        this.localLoadImages(actual.background, 'background');
      }
    }
  }

  private loadImage(url: string): Observable<string> {
    if (
      /^https?:\/\/storage\.googleapis\.com/i.exec(url) != null ||
      /^data:image/i.exec(url) != null
    ) {
      return of(url);
    }
    if (!url) {
      return of('');
    }
    let theUrl = url;
    if (typeof this.options.useRoot == 'string') {
      theUrl = this.options.useRoot + url.replace(/^\/+/, '');
    }
    return this.httpClient.get(theUrl, { responseType: 'blob' }).pipe(
      map((e) => {
        return URL.createObjectURL(e);
      })
    );
  }

  async blob2Base64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', async (event: any) => {
        const base64 = event.target.result;
        resolve(base64);
      });
      if (blob instanceof Blob) {
        reader.readAsDataURL(blob);
      }
    });
  }

  async guardarInterno(type: string, blob: Blob | null, fileName: string) {
    if (!blob) {
      return;
    }
    if (!this.url) {
      this.url = {};
    }
    const response = await this.fileService.save({
      fileName,
      base64: await this.blob2Base64(blob),
    });
    if (type == 'actor') {
      this.url.actor = response.key + '?t=' + new Date().getTime();
    } else if (type == 'sketch') {
      this.url.sketch = response.key + '?t=' + new Date().getTime();
    } else if (type == 'background') {
      this.url.background = response.key + '?t=' + new Date().getTime();
    }
  }

  async guardar() {
    const fileNames = this.defaultFileName;
    const promesas = [];
    if (this.changes.sketch) {
      promesas.push(
        new Promise<void>((resolve, reject) => {
          this.canvas.toBlob(async (temp) => {
            try {
              if (fileNames.sketch) {
                await this.guardarInterno('sketch', temp, fileNames.sketch);
                this.changes.sketch = false;
                resolve();
              }
            } catch (err) {}
          }, 'image/png');
        })
      );
    }
    if (this.changes.background) {
      promesas.push(
        new Promise<void>((resolve, reject) => {
          this.canvasBackground.toBlob(async (temp) => {
            try {
              if (fileNames.background) {
                await this.guardarInterno(
                  'background',
                  temp,
                  fileNames.background
                );
                this.changes.background = false;
                resolve();
              }
            } catch (err) {}
          }, 'image/jpeg');
        })
      );
    }
    if (this.changes.actor) {
      promesas.push(
        new Promise<void>((resolve, reject) => {
          this.canvasGreen.toBlob(async (temp) => {
            try {
              if (fileNames.actor) {
                await this.guardarInterno('actor', temp, fileNames.actor);
                this.changes.actor = false;
                resolve();
              }
            } catch (err) {}
          }, 'image/png');
        })
      );
    }
    await Promise.all(promesas);
    if (promesas.length > 0) {
      console.log(JSON.stringify(this.url));
      this.urlChange.emit(this.url);
    }
  }

  useTool(tool: string) {
    this.lastTool = tool;
    if (tool == 'lapiz') {
      this.setStrokeOptions(this.lastStrokeColor);
      this.setStrokeOptions(this.lastStrokeSize);
    } else if (tool == 'borrador') {
      this.setStrokeOptions({
        strokeStyle: 'rgba(0,0,0,1.0)',
        lineWidth: 20,
      });
    }
  }

  setStrokeSize(options: StrokeOptionsData) {
    this.setStrokeOptions(options);
    this.lastStrokeSize = options;
  }

  setStrokeColor(options: StrokeOptionsData) {
    this.setStrokeOptions(options);
    this.lastStrokeColor = options;
  }

  setStrokeOptions(options: StrokeOptionsData) {
    if (!this.context) {
      return;
    }
    if (options.lineCap) {
      this.context.lineCap = options.lineCap;
    }
    if (options.lineJoin) {
      this.context.lineJoin = options.lineJoin;
    }
    if (options.strokeStyle) {
      this.context.strokeStyle = options.strokeStyle;
    }
    if (options.lineWidth) {
      this.context.lineWidth = options.lineWidth;
    }
  }

  private createUserEvents() {
    if (!this.eventsContainerRef) {
      return;
    }
    const eventsContainerRef = this.eventsContainerRef.nativeElement;
    eventsContainerRef.addEventListener('mousedown', this.pressEventHandler);
    eventsContainerRef.addEventListener('mousemove', this.dragEventHandler);
    eventsContainerRef.addEventListener('mouseup', this.releaseEventHandler);
    eventsContainerRef.addEventListener('mouseout', this.cancelEventHandler);

    eventsContainerRef.addEventListener('touchstart', this.pressEventHandler);
    eventsContainerRef.addEventListener('touchmove', this.dragEventHandler);
    eventsContainerRef.addEventListener('touchend', this.releaseEventHandler);
    eventsContainerRef.addEventListener('touchcancel', this.cancelEventHandler);
  }

  private redraw() {
    let clickX = this.clickX;
    let context = this.context;
    if (!context) {
      return;
    }
    let clickDrag = this.clickDrag;
    let clickY = this.clickY;
    for (let i = 0; i < clickX.length; ++i) {
      if (this.lastTool == 'lapiz') {
        context.globalCompositeOperation = 'source-over';
      } else if (this.lastTool == 'borrador') {
        context.globalCompositeOperation = 'destination-out';
      }
      context.beginPath();
      if (clickDrag[i] && i) {
        context.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        context.moveTo(clickX[i] - 1, clickY[i]);
      }
      context.lineTo(clickX[i], clickY[i]);
      context.stroke();
    }
    this.changes.sketch = true;
    context.closePath();
  }

  private addClick(x: number, y: number, dragging: boolean) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
  }

  async clearCanvas(option: string) {
    const response = await this.modalSrv.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    let contexto = null;
    const MAP: any = {
      gesture: this.context,
      actor: this.contextGreen,
      background: this.contextBackground,
    };
    contexto = MAP[option];
    if (!contexto) {
      return;
    }
    contexto.clearRect(0, 0, this.options.width, this.options.height);
  }

  private releaseEventHandler = () => {
    this.paint = false;
    this.redraw();
  };

  private cancelEventHandler = () => {
    this.paint = false;
  };

  private getGlobalOffset(el: HTMLElement) {
    let x = 0;
    let y = 0;
    x += el.offsetLeft;
    y += el.offsetTop;
    if (el.offsetParent) {
      const response = this.getGlobalOffset(el.offsetParent as HTMLElement);
      x += response.x;
      y += response.y;
    }
    return {
      x,
      y,
    };
  }

  private getCoordinatesFromEvent(e: MouseEvent | TouchEvent) {
    const source = e.target || e.srcElement;
    const touchEvent = e as TouchEvent;
    const mouseEvent = e as MouseEvent;
    const scalingFactor = this.canvas.width / this.canvas.clientWidth;
    let mouseX = touchEvent.changedTouches
      ? touchEvent.changedTouches[0].pageX
      : mouseEvent.pageX;
    let mouseY = touchEvent.changedTouches
      ? touchEvent.changedTouches[0].pageY
      : mouseEvent.pageY;
    if (source) {
      const el = source as HTMLElement;
      const response = this.getGlobalOffset(el);
      mouseX -= response.x;
      mouseY -= response.y;
    }

    mouseX *= scalingFactor;
    mouseY *= scalingFactor;
    return {
      mouseX,
      mouseY,
    };
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
    this.paint = true;
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.addClick(mouseX, mouseY, false);
    this.redraw();
  };

  private dragEventHandler = (e: MouseEvent | TouchEvent) => {
    const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
    if (this.paint) {
      this.addClick(mouseX, mouseY, true);
      this.redraw();
    }

    e.preventDefault();
  };
}
