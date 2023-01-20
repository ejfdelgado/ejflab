import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { PageData } from 'src/interfaces/login-data.interface';
import { BackendPageService } from 'src/services/backendPage.service';

@Component({
  selector: 'app-pagepopup',
  templateUrl: './pagepopup.component.html',
  styleUrls: ['./pagepopup.component.css'],
})
export class PagepopupComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<PagepopupComponent>,
    private fb: FormBuilder,
    private backendPageSrv: BackendPageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(64)]],
      description: ['', [Validators.maxLength(512)]],
    });
    this.backendPageSrv
      .getCurrentPage()
      .then((data: PageData) => {
        this.form.setValue({
          title: data.tit,
          description: data.desc,
        });
      })
      .catch((err) => {});
  }

  get title() {
    return this.form.get('title');
  }

  get description() {
    return this.form.get('description');
  }

  getMaxLengthMessage(label: string, error: any | null): string {
    if (error && error.maxlength) {
      return `Máximo ${error.maxlength.requiredLength} letras. Actualmente hay ${error.maxlength.actualLength}.`;
    }
    return '';
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  guardar() {}
}
