import { HttpClient } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {
  BehaviorSubject,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { FileBase64Data } from 'src/app/components/base/base.component';
import {
  FileResponseData,
  FileService,
} from 'src/services/file.service';
import { FileRequestData, FileSaveData } from 'src/services/fileInterface';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';

export interface ImagepickerOptionsData {
  isRounded?: boolean;
  isEditable?: boolean;
  useBackground?: boolean;
  defaultImage?: string;
  useRoot?: string;
  autosave?: boolean;
  askType?: string; //fileimage fileimage-photo photo
  defaultFileName?: string | null;
}

@Component({
  selector: 'app-imagepicker',
  templateUrl: './imagepicker.component.html',
  styleUrls: ['./imagepicker.component.css'],
})
export class ImagepickerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() options: ImagepickerOptionsData;
  @Input() url: string | null;
  @Output() urlChange = new EventEmitter<string | null>();
  @Input() fileName: string;
  @Output() eventSave = new EventEmitter<FileBase64Data>();
  private src$: BehaviorSubject<string | null> | null = null;
  background: SafeUrl | null = null;
  private backgroundSubscription: Subscription | null = null;
  dataUrl$: Observable<SafeUrl> | null = null;
  constructor(
    private httpClient: HttpClient,
    private domSanitizer: DomSanitizer,
    public fileService: FileService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.backgroundSubscription != null) {
      this.backgroundSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: any) {
    if (changes.url) {
      if (typeof changes.url.currentValue == 'string') {
        if (this.src$ == null) {
          this.src$ = new BehaviorSubject<string | null>(this.url);
          this.dataUrl$ = this.src$.pipe(
            switchMap((url) => this.loadImage(url))
          );
          this.backgroundSubscription = this.dataUrl$.subscribe((url) => {
            if (this.options.useBackground) {
              this.background = url;
            } else {
              this.background = null;
            }
          });
        }
      }
      if (this.src$ != null) {
        this.src$.next(changes.url.currentValue);
      }
    }
  }

  public async saveFile(options: FileSaveData, suffix: string = '') {
    try {
      const response = await this.fileService.save(options);
      response.key = response.key + '?t=' + new Date().getTime() + suffix;
      return response;
    } catch (err: any) {
      this.modalService.error(err);
      throw err;
    }
  }

  async processFile(responseData: FileResponseData) {
    // Pese a que responseData tiene fileName, no se usa, sino el local
    if (this.options.autosave === true) {
      const response = await this.saveFile({
        base64: responseData.base64,
        fileName: this.fileName,
      });
      this.url = response.key;
      this.urlChange.emit(this.url);
    } else {
      this.eventSave.emit({
        base64: responseData.base64,
        name: this.fileName,
        type: 'image',
      });
    }
    if (this.src$ != null) {
      this.src$.next(responseData.base64);
    }
  }

  askForImage() {
    // fileimage fileimage-photo photo
    const options: FileRequestData = {
      type: 'fileimage-photo',
      defaultFileName: this.options.defaultFileName,
    };
    const processFileThis = this.processFile.bind(this);
    this.fileService.sendRequest(options, processFileThis);
  }

  private loadImage(url: string | null): Observable<SafeUrl> {
    if (url == null) {
      if (typeof this.options.defaultImage == 'string') {
        return of(this.options.defaultImage);
      } else {
        return of(MyConstants.PAGE.NO_IMAGE);
      }
    } else {
      if (
        /^https?:\/\/storage\.googleapis\.com/i.exec(url) != null ||
        /^data:image/i.exec(url) != null
      ) {
        return of(url);
      } else {
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
                return this.domSanitizer.bypassSecurityTrustUrl(
                  URL.createObjectURL(e)
                );
              })
            )
        );
      }
    }
  }
}
