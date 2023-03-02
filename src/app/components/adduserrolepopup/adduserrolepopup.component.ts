import { Component, OnInit } from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalService } from 'src/services/modal.service';
import { MyConstants } from 'srcJs/MyConstants';
import { AuthorizationData } from '../authorizationpopup/authorizationpopup.component';

@Component({
  selector: 'app-adduserrolepopup',
  templateUrl: './adduserrolepopup.component.html',
  styleUrls: ['./adduserrolepopup.component.css'],
})
export class AdduserrolepopupComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  losRoles = MyConstants.ROLES;

  constructor(
    private dialogRef: MatDialogRef<AdduserrolepopupComponent>,
    private fb: FormBuilder,
    private modalSrv: ModalService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      who: ['', [Validators.required, Validators.maxLength(128)]],
      role: ['', [Validators.required]],
    });
  }

  get who() {
    return this.form.get('who');
  }

  get role() {
    return this.form.get('role');
  }

  cancelar() {
    this.dialogRef.close();
  }

  getMaxLengthMessage(label: string, error: any | null): string {
    if (error && error.maxlength) {
      return `Máximo ${error.maxlength.requiredLength} letras. Actualmente hay ${error.maxlength.actualLength}.`;
    }
    return '';
  }

  async guardar() {
    const valores: AuthorizationData = {
      who: this.form.value.who,
      role: this.form.value.role,
      version: 1,
    };
    if (this.form.valid) {
      this.dialogRef.close(valores);
    } else {
      this.modalSrv.alert({
        tit: 'Ups...',
        txt: 'Verifica tus datos antes de continuar.',
      });
    }
  }
}
