import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';

export interface ImagepickerOptionsData {
  isRounded?: boolean;
  isEditable?: boolean;
}

@Component({
  selector: 'app-imagepicker',
  templateUrl: './imagepicker.component.html',
  styleUrls: ['./imagepicker.component.css'],
})
export class ImagepickerComponent implements OnInit {
  @Input() options: ImagepickerOptionsData;
  @Input() url: string;
  @Output() changedImage = new EventEmitter<string>();
  localImage: string;
  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: any) {
    if (changes.url) {
      this.localImage = changes.url.currentValue;
    }
  }

  processFile(imageInput: any) {
    const file: File = imageInput.files[0];
    const reader = new FileReader();

    reader.addEventListener('load', (event: any) => {
      this.localImage = event.target.result;
      this.changedImage.emit(this.localImage);
      //console.log(event.target.result, file);
    });

    reader.readAsDataURL(file);
  }
}
