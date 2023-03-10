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
import { Observable, map } from 'rxjs';
import {
  FileResponseData,
  FileSaveData,
  FileService,
} from 'src/services/file.service';
import { ModalService } from 'src/services/modal.service';
import { MyAudioService } from 'src/services/myaudio.service';
import { MyLame } from 'srcJs/lame';
import Wavesurfer from 'wavesurfer.js';
import MarkersPlugin from 'wavesurfer.js/src/plugin/markers';

export interface AudioOptionsData {
  useRoot?: string;
  isEditable?: boolean;
  autosave?: boolean;
}

export class mp3cutter {
  start: number;
  end: number;
  callback: Function;
  bitrate: number;
  audioContext: AudioContext;
  async cut(
    src: Blob,
    start: number,
    end: number,
    callback: Function,
    bitrate = 192
  ) {
    if (!src) throw 'Invalid parameters!';

    if (start > end) throw 'Start is bigger than end!';
    else if (start < 0 || end < 0)
      throw 'Start or end is negative, cannot process';
    this.start = start;
    this.end = end;
    this.callback = callback;
    this.bitrate = bitrate;

    // Convert blob into ArrayBuffer
    let buffer = await new Response(src).arrayBuffer();
    this.audioContext = new AudioContext();

    //Convert ArrayBuffer into AudioBuffer
    this.audioContext.decodeAudioData(buffer).then((decodedData) => {
      this.computeData(decodedData);
    });
  }

  computeData(decodedData: AudioBuffer) {
    //Compute start and end values in secondes
    let computedStart =
      (decodedData.length * this.start) / decodedData.duration;
    let computedEnd = (decodedData.length * this.end) / decodedData.duration;

    //Create a new buffer
    const newBuffer = this.audioContext.createBuffer(
      decodedData.numberOfChannels,
      computedEnd - computedStart,
      decodedData.sampleRate
    );

    // Copy from old buffer to new with the right slice.
    // At this point, the audio has been cut
    for (var i = 0; i < decodedData.numberOfChannels; i++) {
      newBuffer.copyToChannel(
        decodedData.getChannelData(i).slice(computedStart, computedEnd),
        i
      );
    }

    // Bitrate is  by default 192, but can be whatever you want
    const lame: any = MyLame.lamejs();
    console.log(lame);
    let encoder: any = lame['Mp3Encoder'](
      decodedData.numberOfChannels,
      newBuffer.sampleRate,
      this.bitrate
    );

    //Recreate Object from AudioBuffer
    let formattedArray = {
      channels: Array.apply(
        null,
        new Array(newBuffer.numberOfChannels - 1 - 0 + 1)
      )
        .map((v, i) => i + 0)
        .map((i) => newBuffer.getChannelData(i)),
      sampleRate: newBuffer.sampleRate,
      length: newBuffer.length,
    };

    //Encode into mp3
    encoder.encodeBuffer(formattedArray.channels);
    var mp3buf = encoder.flush(); //finish writing mp3

    var mp3Data = [];
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }
    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    this.callback(blob);
  }
}

@Component({
  selector: 'app-audioeditor',
  templateUrl: './audioeditor.component.html',
  styleUrls: ['./audioeditor.component.css'],
})
export class AudioeditorComponent implements OnInit {
  isRecording = false;
  isPlaying = false;
  recordedTime: String;
  blobUrl: SafeUrl | null;
  @ViewChild('audioRef') audioRef: ElementRef;
  @ViewChild('myWaveFormRef') myWaveFormRef: ElementRef;
  myWaveForm: Wavesurfer | null = null;
  markerTi: any = null;
  markerTf: any = null;
  @Input() options: AudioOptionsData;
  @Input() url: string | null;
  @Output() urlChange = new EventEmitter<string | null>();
  @Input() fileName: string;
  currentBlob: Blob | null = null;
  recordedBlob: Blob | null = null;

  constructor(
    private audioRecordingService: MyAudioService,
    private sanitizer: DomSanitizer,
    private modalSrv: ModalService,
    public cdr: ChangeDetectorRef,
    public fileService: FileService,
    private httpClient: HttpClient
  ) {
    this.audioRecordingService
      .recordingFailed()
      .subscribe(() => (this.isRecording = false));
    this.audioRecordingService
      .getRecordedTime()
      .subscribe((time) => (this.recordedTime = time));
    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.recordedBlob = data.blob;
      this.receiveBlob(this.recordedBlob);
    });
  }

  cut() {
    const blob = this.currentBlob;
    const ti = this.markerTi.time;
    const tf = this.markerTf.time;

    if (blob) {
      new mp3cutter().cut(blob, ti, tf, (blobCut: Blob) => {
        console.log(blobCut);
      });
    }
  }

  ngOnChanges(changes: any) {
    if (changes.url) {
      if (typeof changes.url.currentValue == 'string') {
        if (typeof changes.url.previousValue == 'string') {
          // Había una url antes y puede que sea la misma, solo cambio el query param
        } else {
          // Fijo toca cargar el archivo
          this.loadUrl(changes.url.currentValue).subscribe((blob) => {
            this.receiveBlob(blob);
          });
        }
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

  receiveBlob(blob: Blob) {
    // https://wavesurfer-js.org/docs/methods.html
    this.currentBlob = blob;
    const objectUrl = URL.createObjectURL(blob);
    this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    if (this.myWaveForm) {
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
      label: 'ti',
      color: '#ff990a',
      draggable: true,
    });

    this.markerTf = this.myWaveForm['addMarker']({
      time: 9999999999,
      label: 'tf',
      color: '#ff990a',
      draggable: true,
    });

    this.myWaveForm.on('finish', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
    this.myWaveForm.on('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
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
