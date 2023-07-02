import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalService } from 'src/services/modal.service';
import { IndicatorService } from 'src/services/indicator.service';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-loginpopup',
  templateUrl: './loginpopup.component.html',
  styleUrls: ['./loginpopup.component.css'],
})
export class LoginpopupComponent implements OnInit {
  currentView = 'inicio';
  form: FormGroup;
  faXmark = faXmark;
  constructor(
    private modalService: ModalService,
    private readonly authService: AuthService,
    public dialogRef: MatDialogRef<LoginpopupComponent>,
    private fb: FormBuilder,
    private indicator: IndicatorService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  mostrarFormulario() {
    this.currentView = 'formulario';
  }

  loginWithGoogle(event: any) {
    const wait = this.indicator.start();
    this.authService
      .loginWithGoogle()
      .then(() => {
        this.dialogRef.close();
        // Force reload...
        location.reload();
      })
      .catch((e) => {
        const errorCode = e.code;
        const MAPEO: { [key: string]: string } = {
          'auth/account-exists-with-different-credential':
            'El usuario ya existe pero con otra cuenta.',
          'auth/auth-domain-config-required':
            'Configuración de dominio requerida',
          'auth/cancelled-popup-request': 'Se canceló la ventana emergente.',
          'auth/operation-not-allowed': 'Operación no permitida',
          'auth/operation-not-supported-in-this-environment':
            'Operación no soportada en este ambiente.',
          'auth/popup-blocked': 'Se bloqueó la ventana emergente.',
          'auth/popup-closed-by-user': 'Se cerró la ventana emergente.',
          'auth/unauthorized-domain': 'Dominio no autorizado',
          'auth/too-many-requests':
            'Demasiados intentos fallidos, tal vez se inhabilitó la cuenta.',
        };
        if (errorCode in MAPEO) {
          const mensaje: string = MAPEO[errorCode];
          this.modalService.error(new Error(mensaje));
        } else {
          this.modalService.error(e);
        }
      })
      .finally(() => {
        wait.done();
      });
  }

  ingresar(event?: any) {
    const wait = this.indicator.start();
    this.authService
      .login(this.form.value)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((e) => {
        const errorCode = e.code;
        const MAPEO: { [key: string]: string } = {
          'auth/invalid-email': 'Correo inválido.',
          'auth/user-disabled': 'Usuario inhabilitado.',
          'auth/user-not-found': 'Usuario no existe.',
          'auth/wrong-password': 'Contraseña incorrecta.',
          'auth/too-many-requests':
            'Demasiados intentos fallidos, tal vez se inhabilitó la cuenta.',
          'auth/network-request-failed':
            'Fallo de internet, reintenta más tarde.',
        };
        if (errorCode in MAPEO) {
          const mensaje: string = MAPEO[errorCode];
          this.modalService.error(new Error(mensaje));
        } else {
          this.modalService.error(e);
        }
      })
      .finally(() => {
        wait.done();
      });
  }

  crearCuenta(event: any) {
    const wait = this.indicator.start();
    this.authService
      .register(this.form.value)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((e) => {
        const errorCode = e.code;
        const MAPEO: { [key: string]: string } = {
          'auth/email-already-in-use':
            'Ya hay un usuario creado con ese correo.',
          'auth/invalid-email': 'Correo inválido.',
          'auth/operation-not-allowed':
            'Correo inhabilitado para crear cuenta.',
          'auth/weak-password':
            'La contraseña no es lo suficientemente fuerte.',
          'auth/too-many-requests':
            'Demasiados intentos fallidos, tal vez se inhabilitó la cuenta.',
        };
        if (errorCode in MAPEO) {
          const mensaje: string = MAPEO[errorCode];
          this.modalService.error(new Error(mensaje));
        } else {
          this.modalService.error(e);
        }
      })
      .finally(() => {
        wait.done();
      });
  }

  regresar() {
    this.currentView = 'inicio';
  }

  onSubmit() {
    this.ingresar();
  }
}
