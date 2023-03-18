import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import RecordRTC from 'recordrtc';
import { Observable, map, Subscription } from 'rxjs';
import {
  FileResponseData,
  FileSaveData,
  FileService,
} from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { MyAudioService } from 'src/services/myaudio.service';
import Wavesurfer from 'wavesurfer.js';
import MarkersPlugin from 'wavesurfer.js/src/plugin/markers';

export interface AudioOptionsData {
  useRoot?: string;
  //autosave?: boolean;
  canCut?: boolean;
  canDownload?: boolean;
  canUpload?: boolean;
  canDelete?: boolean;
  canSave?: boolean;
  showWaveForm?: boolean;
}

export interface AudioCutData {
  ti: number;
  tf: number;
  t: number;
  blob: Blob;
}

@Component({
  selector: 'app-audioeditor',
  templateUrl: './audioeditor.component.html',
  styleUrls: ['./audioeditor.component.css'],
})
export class AudioeditorComponent implements OnInit {
  @Input() options: AudioOptionsData;
  @Input() url: string | null;
  @Input() fileName: string;
  @Input() externalBlob: Blob | null = null;
  @Output() urlChange = new EventEmitter<string | null>();
  @Output() cutEvent = new EventEmitter<AudioCutData>();
  @Output() gotAudioBlob = new EventEmitter<Blob>();
  recordedBlob: Blob | null = null;

  isLoading = false;
  isRecording = false;
  isPlaying = false;
  recordedTime: String;
  blobUrl: SafeUrl | null;
  @ViewChild('audioRef') audioRef: ElementRef;
  @ViewChild('myWaveFormRef') myWaveFormRef: ElementRef;
  myWaveForm: Wavesurfer | null = null;
  markerTi: any = null;
  markerTf: any = null;
  currentBlob: Blob | null = null;
  mediaRecorder: MediaRecorder | null = null;
  responsiveWaveListener: any | null = null;
  recordSubscriptions: Array<Subscription> = [];

  constructor(
    private audioRecordingService: MyAudioService,
    private sanitizer: DomSanitizer,
    private modalSrv: ModalService,
    public cdr: ChangeDetectorRef,
    public fileService: FileService,
    private httpClient: HttpClient
  ) {}

  subscribe() {
    this.recordSubscriptions.push(
      this.audioRecordingService.recordingFailed().subscribe(() => {
        this.isRecording = false;
        this.unsubscribe();
      })
    );
    this.recordSubscriptions.push(
      this.audioRecordingService.getRecordedBlob().subscribe((data) => {
        this.recordedBlob = data.blob;
        this.receiveBlob(this.recordedBlob);
        this.unsubscribe();
      })
    );
  }

  unsubscribe() {
    for (let i = 0; i < this.recordSubscriptions.length; i++) {
      const actual = this.recordSubscriptions[i];
      actual.unsubscribe();
    }
  }

  cut() {
    const blob = this.currentBlob;
    const ti = this.markerTi.time;
    const tf = this.markerTf.time;

    const sampleDuration = tf - ti;
    if (blob && this.mediaRecorder) {
      const myFunction = async (e: BlobEvent) => {
        const sampleObject: AudioCutData = {
          blob: e.data,
          t: sampleDuration,
          ti: ti,
          tf: tf,
        };
        this.cutEvent.emit(sampleObject);
        if (this.mediaRecorder) {
          this.mediaRecorder.removeEventListener('dataavailable', myFunction);
        }
      };
      this.mediaRecorder.addEventListener('dataavailable', myFunction);
      this.play();
      this.mediaRecorder.start();
      setTimeout(() => {
        if (this.mediaRecorder) {
          this.mediaRecorder.stop();
        }
      }, sampleDuration * 1000);
    }
  }

  ngOnChanges(changes: any) {
    if (changes.url) {
      if (
        typeof changes.url.currentValue == 'string' &&
        changes.url.currentValue.length > 0
      ) {
        if (typeof changes.url.previousValue == 'string') {
          // Había una url antes y puede que sea la misma, solo cambio el query param
        } else {
          this.isLoading = true;
          // Fijo toca cargar el archivo
          this.loadUrl(changes.url.currentValue).subscribe((blob) => {
            this.receiveBlob(blob);
          });
        }
      }
    }
    if (changes.externalBlob && changes.externalBlob.currentValue) {
      if (changes.externalBlob.currentValue instanceof Blob) {
        setTimeout(() => {
          this.recordedBlob = changes.externalBlob.currentValue;
          if (this.recordedBlob != null) {
            this.receiveBlob(this.recordedBlob);
          }
        }, 0);
      }
    }
  }

  loadUrl(url: string): Observable<Blob> {
    let theUrl = url;
    if (typeof this.options.useRoot == 'string') {
      theUrl = this.options.useRoot + url.replace(/^\/+/, '');
    }
    return (
      this.httpClient
        // load the image as a blob
        .get(theUrl, { responseType: 'blob' })
        // create an object url of that blob that we can use in the src attribute
        .pipe(
          map((e) => {
            return e;
          })
        )
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

  async receiveBlob(blob: Blob) {
    // https://wavesurfer-js.org/docs/methods.html
    //console.log(await this.blob2Base64(blob));
    this.currentBlob = blob;
    this.gotAudioBlob.emit(blob);
    const objectUrl = URL.createObjectURL(blob);
    this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    if (this.options.showWaveForm === false) {
      return;
    }
    if (this.myWaveForm) {
      window.removeEventListener('resize', this.responsiveWaveListener);
      this.myWaveForm.destroy();
    }
    this.myWaveForm = Wavesurfer.create({
      container: this.myWaveFormRef.nativeElement,
      scrollParent: true,
      //fillParent: true,
      height: 50,
      plugins: [
        MarkersPlugin.create({
          markers: [],
        }),
      ],
    });

    this.myWaveForm.loadBlob(blob);
    this.markerTi = this.myWaveForm['addMarker']({
      time: 0,
      label: 'Inicio',
      color: '#00ff00',
      draggable: true,
    });

    const streamDestination: MediaStreamAudioDestinationNode =
      this.myWaveForm.backend.getAudioContext().createMediaStreamDestination();
    const gainNode: GainNode = this.myWaveForm.backend
      .getAudioContext()
      .createGain();
    gainNode.connect(streamDestination);
    this.myWaveForm.backend.setFilter(gainNode);
    this.mediaRecorder = new MediaRecorder(streamDestination.stream);

    this.myWaveForm.on('finish', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
    this.myWaveForm.on('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
    this.myWaveForm.on('ready', () => {
      if (this.myWaveForm) {
        const segundos = this.myWaveForm.getDuration();
        this.markerTf = this.myWaveForm['addMarker']({
          time: segundos,
          label: 'Fin',
          color: '#ff0000',
          draggable: true,
          position: 'top',
        });
      }
      this.isLoading = false;
    });
    this.responsiveWaveListener = this.myWaveForm.util.debounce(() => {
      if (this.myWaveForm) {
        this.myWaveForm['drawer'].updateSize();
        try {
          this.myWaveForm['drawBuffer']();
        } catch (err) {}
      }
    }, 0);

    window.addEventListener('resize', this.responsiveWaveListener);
  }

  ngOnInit(): void {}

  public async saveFile(options: FileSaveData, suffix: string = '') {
    try {
      const response = await this.fileService.save(options);
      response.key = response.key + '?t=' + new Date().getTime() + suffix;
      return response;
    } catch (err: any) {
      this.modalSrv.error(err);
      throw err;
    }
  }

  async internalSave(base64: string) {
    const response = await this.saveFile({
      base64: base64,
      fileName: this.fileName,
      erasefile: this.url, // send old file
    });
    this.recordedBlob = null;
    this.url = response.key;
    this.urlChange.emit(this.url);
  }

  async save() {
    const reader = new FileReader();
    reader.addEventListener('load', async (event: any) => {
      const base64 = event.target.result;
      await this.internalSave(base64);
    });
    if (this.recordedBlob instanceof Blob) {
      reader.readAsDataURL(this.recordedBlob);
    }
  }

  play() {
    this.isPlaying = true;
    if (this.myWaveForm) {
      this.myWaveForm.play(this.markerTi.time, this.markerTf.time);
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.myWaveForm) {
      this.myWaveForm.pause();
    }
  }

  startRecording() {
    if (!this.isRecording) {
      this.subscribe();
      this.isRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopRecording() {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
    }
  }

  async clearRecordedData() {
    const response = await this.modalSrv.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    this.blobUrl = null;
    if (this.myWaveForm) {
      this.myWaveForm.destroy();
    }
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.unsubscribe();
    if (this.myWaveForm) {
      this.myWaveForm.destroy();
    }
  }

  getCompleteUrl(url: string | null) {
    if (url == null) {
      return null;
    }
    let theUrl = url;
    if (typeof this.options.useRoot == 'string') {
      theUrl = this.options.useRoot + url.replace(/^\/+/, '');
    }
    if (theUrl.startsWith('/')) {
      theUrl = `${location.origin}${theUrl}`;
    }
    return theUrl;
  }

  async processFile(responseData: FileResponseData) {
    const base64Response = await fetch(responseData.base64);
    const blob = await base64Response.blob();
    this.receiveBlob(blob);
  }

  uploadFile() {
    const processFileThis = this.processFile.bind(this);
    this.fileService.sendRequest({ type: 'fileaudio' }, processFileThis);
  }

  download(): void {
    if (this.currentBlob == null) {
      return;
    }
    const url = window.URL.createObjectURL(this.currentBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = this.fileName;
    link.click();
  }
}
