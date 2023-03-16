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
import { map, Observable, of } from 'rxjs';
import { FileRequestData, FileService } from 'src/services/file.service';
import { IndicatorService } from 'src/services/indicator.service';
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

export interface PickedData {
  color: Uint8ClampedArray;
  hsv?: Array<number>;
  hsl?: Array<number>;
  x: number;
  y: number;
}

export interface SeedData {
  x: number;
  y: number;
}

@Component({
  selector: 'app-canvaseditor',
  templateUrl: './canvaseditor.component.html',
  styleUrls: ['./canvaseditor.component.css'],
})
export class CanvaseditorComponent implements OnInit, OnChanges {
  static MAX_UNDO_SIZE = 7;
  static HUE_SIMILITUD_360 = 10;
  static SAT_MIN = 0.4;
  static VAL_MIN = 0.3;
  static MAPEO_MODES: any = {
    edit_sketch: 'sketch',
    edit_actor: 'actor',
    edit_background: 'background',
  };
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

  isWorkingHard = false;
  mode: string = 'none';
  private isDragging: boolean;

  private pickedPoint: PickedData | null = null;
  private clickX: number[] = [];
  private clickY: number[] = [];
  private clickDrag: boolean[] = [];
  private snapshots: Map<string, Array<Blob>> = new Map();

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
    private indicatorSrv: IndicatorService
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
        this.localLoadImages(actual.sketch, 'sketch').then(() => {
          this.takeSnapshot('sketch');
        });
      }
      if (actual.actor) {
        this.localLoadImages(actual.actor, 'actor').then(() => {
          this.takeSnapshot('actor');
        });
      }
      if (actual.background) {
        this.localLoadImages(actual.background, 'background').then(() => {
          this.takeSnapshot('background');
        });
      }
    }
  }

  private loadImage(url: string): Observable<string> {
    if (
      /^https?:\/\/storage\.googleapis\.com/i.exec(url) != null ||
      /^data:image/i.exec(url) != null ||
      /^blob:/i.exec(url) != null
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

  getImageBlobFromCanvas(type: string): Promise<Blob | null> {
    return new Promise<Blob | null>((resolve, reject) => {
      let localCanvas = null;
      let mimeType = 'image/png';
      if (type == 'sketch') {
        localCanvas = this.canvas;
      } else if (type == 'actor') {
        localCanvas = this.canvasGreen;
      } else if (type == 'background') {
        localCanvas = this.canvasBackground;
        mimeType = 'image/jpeg';
      }
      if (localCanvas) {
        localCanvas.toBlob((temp) => {
          resolve(temp);
        });
      }
    });
  }

  async guardar() {
    const fileNames = this.defaultFileName;
    const promesas = [];
    if (this.changes.sketch) {
      promesas.push(
        new Promise<void>(async (resolve, reject) => {
          const temp = await this.getImageBlobFromCanvas('sketch');
          try {
            if (fileNames.sketch) {
              await this.guardarInterno('sketch', temp, fileNames.sketch);
              this.changes.sketch = false;
              resolve();
            }
          } catch (err) {}
        })
      );
    }
    if (this.changes.background) {
      promesas.push(
        new Promise<void>(async (resolve, reject) => {
          const temp = await this.getImageBlobFromCanvas('background');
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
        })
      );
    }
    if (this.changes.actor) {
      promesas.push(
        new Promise<void>(async (resolve, reject) => {
          const temp = await this.getImageBlobFromCanvas('actor');
          try {
            if (fileNames.actor) {
              await this.guardarInterno('actor', temp, fileNames.actor);
              this.changes.actor = false;
              resolve();
            }
          } catch (err) {}
        })
      );
    }
    await Promise.all(promesas);
    this.changeToMode('none');
    if (promesas.length > 0) {
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
      sketch: this.context,
      actor: this.contextGreen,
      background: this.contextBackground,
    };
    contexto = MAP[option];
    if (option == 'sketch') {
      this.changes.sketch = true;
    } else if (option == 'actor') {
      this.changes.actor = true;
    } else if (option == 'background') {
      this.changes.background = true;
    }

    if (!contexto) {
      return;
    }
    contexto.clearRect(0, 0, this.options.width, this.options.height);
  }

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

  private startPaint(mouseX: number, mouseY: number) {
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.addClick(mouseX, mouseY, false);
    this.redraw();
  }

  private pickColor(mouseX: number, mouseY: number) {
    if (!this.contextGreen) {
      return;
    }
    try {
      const pixel = this.contextGreen.getImageData(mouseX, mouseY, 1, 1);
      this.pickedPoint = {
        color: pixel.data,
        x: mouseX,
        y: mouseY,
      };
    } catch (err) {
      console.log(err);
    }
  }

  rgb2hsv(r: number, g: number, b: number) {
    let v = Math.max(r, g, b),
      c = v - Math.min(r, g, b);
    let h =
      c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
  }

  rgb2hsl(r: number, g: number, b: number) {
    let v = Math.max(r, g, b),
      c = v - Math.min(r, g, b),
      f = 1 - Math.abs(v + v - c - 1);
    let h =
      c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
  }

  private floodfill(point: SeedData, isEmpty: Function, setPixel: Function) {
    const stack = Array();
    stack.push(point); // Push the seed
    while (stack.length > 0) {
      var currPoint = stack.pop();
      if (isEmpty(currPoint)) {
        // Check if the point is not filled
        setPixel(currPoint); // Fill the point with the foreground
        stack.push({ x: currPoint.x + 1, y: currPoint.y }); // Fill the east neighbour
        stack.push({ x: currPoint.x, y: currPoint.y + 1 }); // Fill the south neighbour
        stack.push({ x: currPoint.x - 1, y: currPoint.y }); // Fill the west neighbour
        stack.push({ x: currPoint.x, y: currPoint.y - 1 }); // Fill the north neighbour
      }
    }
  }

  private pixelBelong(seed: PickedData, actual: PickedData) {
    if (seed.hsv && actual.hsv) {
      const diff = Math.abs(seed.hsv[0] - actual.hsv[0]);
      return diff < CanvaseditorComponent.HUE_SIMILITUD_360;
    }
    return false;
  }

  private doSeedPointRegionGrow(context: CanvasRenderingContext2D) {
    if (this.pickedPoint) {
      const pickedPoint: PickedData = this.pickedPoint;
      const data = pickedPoint.color;
      pickedPoint.hsv = this.rgb2hsv(
        data[0] / 255,
        data[1] / 255,
        data[2] / 255
      );
      if (
        !(
          pickedPoint.hsv[1] > CanvaseditorComponent.SAT_MIN &&
          pickedPoint.hsv[2] > CanvaseditorComponent.VAL_MIN
        )
      ) {
        this.modalSrv.alert({
          title: 'Ups!',
          txt: `Debes seleccionar una región con más color. Sat:${pickedPoint.hsv[1].toFixed(
            2
          )}. Val:${pickedPoint.hsv[2].toFixed(2)}`,
        });
        return;
      }

      //const hsl = this.rgb2hsl(data[0] / 255, data[1] / 255, data[2] / 255);
      //const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
      //console.log(rgba);
      //console.log(hsv);
      //console.log(hsl);

      this.floodfill(
        { x: pickedPoint.x, y: pickedPoint.y },
        (point: SeedData) => {
          //pixel belong?
          const pixel = context.getImageData(point.x, point.y, 1, 1);
          if (pixel.data[3] == 0) {
            return false;
          }
          const actual: PickedData = {
            color: pixel.data,
            x: point.x,
            y: point.y,
          };
          actual.hsv = this.rgb2hsv(
            pixel.data[0] / 255,
            pixel.data[1] / 255,
            pixel.data[2] / 255
          );
          return this.pixelBelong(pickedPoint, actual);
        },
        (point: SeedData) => {
          var id = context.createImageData(1, 1);
          var d = id.data;
          d[0] = 0;
          d[1] = 0;
          d[2] = 0;
          d[3] = 0;
          context.putImageData(id, point.x, point.y);
        }
      );
      this.takeSnapshot();
      this.pickedPoint = null;
    }
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    if (this.isWorkingHard) {
      return;
    }
    const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
    this.isDragging = true;
    if (this.mode == 'edit_actor') {
      this.pickColor(mouseX, mouseY);
    } else if (this.mode == 'edit_sketch') {
      this.startPaint(mouseX, mouseY);
    }
  };

  private dragEventHandler = (e: MouseEvent | TouchEvent) => {
    if (this.isDragging) {
      const { mouseX, mouseY } = this.getCoordinatesFromEvent(e);
      if (this.mode == 'edit_actor') {
        this.pickColor(mouseX, mouseY);
      } else if (this.mode == 'edit_sketch') {
        this.addClick(mouseX, mouseY, true);
        this.redraw();
      }
      e.preventDefault();
    }
  };

  private releaseEventHandler = () => {
    if (this.mode == 'edit_actor') {
      if (this.isWorkingHard) {
        return;
      }
      this.isWorkingHard = true;
      setTimeout(() => {
        if (this.contextGreen) {
          this.doSeedPointRegionGrow(this.contextGreen);
          setTimeout(() => {
            this.isWorkingHard = false;
          }, 100);
        }
      }, 100);
    } else if (this.mode == 'edit_sketch') {
      this.redraw();
      this.takeSnapshot('sketch');
    }
    this.isDragging = false;
  };

  changeToMode(mode: string) {
    this.mode = mode;
    const type = CanvaseditorComponent.MAPEO_MODES[mode];
    const listaSketch = this.snapshots.get('sketch');
    const listaActor = this.snapshots.get('actor');
    const listaBackground = this.snapshots.get('background');
    if (listaSketch && listaSketch.length > 0) {
      listaSketch.splice(0, listaSketch.length);
    }
    if (listaActor && listaActor.length > 0) {
      listaActor.splice(0, listaActor.length);
    }
    if (listaBackground && listaBackground.length > 0) {
      listaBackground.splice(0, listaBackground.length);
    }
    this.takeSnapshot(type);
  }
  private cancelEventHandler = () => {
    if (this.mode == 'edit_actor') {
      this.pickedPoint = null;
    } else if (this.mode == 'edit_sketch') {
    }
    this.isDragging = false;
  };
  private async takeSnapshot(type: string | null = null) {
    if (type == null) {
      type = CanvaseditorComponent.MAPEO_MODES[this.mode];
    }
    if (type == null) {
      return;
    }
    const blob = await this.getImageBlobFromCanvas(type);
    if (blob) {
      if (!this.snapshots.has(type)) {
        this.snapshots.set(type, []);
      }
      const lista = this.snapshots.get(type);
      if (lista) {
        const diferencia =
          lista.length + 1 - CanvaseditorComponent.MAX_UNDO_SIZE;
        if (diferencia >= 0) {
          lista.splice(1, diferencia - 1);
        }
        lista.push(blob);
      }
    }
  }
  canUndo() {
    const type = CanvaseditorComponent.MAPEO_MODES[this.mode];
    const lista = this.snapshots.get(type);
    if (!lista) {
      return false;
    }
    return lista.length > 1;
  }
  acceptImage() {
    if (this.mode == 'edit_actor') {
      this.changes.actor = true;
      this.changeToMode('none');
    }
  }
  cancelImage() {
    if (this.mode == 'edit_actor') {
      this.undoImage(true);
      this.changeToMode('none');
    }
  }
  async undoImage(first = false): Promise<void> {
    const type = CanvaseditorComponent.MAPEO_MODES[this.mode];
    const lista = this.snapshots.get(type);
    if (!lista) {
      return;
    }
    if (lista.length > 1) {
      lista.splice(lista.length - 1, 1);
    }
    let lastBlob = lista[lista.length - 1];
    if (first) {
      lastBlob = lista[0];
    }
    const url = URL.createObjectURL(lastBlob);
    await this.localLoadImages(url, type);
  }
}
