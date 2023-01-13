import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginData } from 'core/interfaces/login-data.interface';
import { AuthService } from 'core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-loginpopup',
  templateUrl: './loginpopup.component.html',
  styleUrls: ['./loginpopup.component.css'],
})
export class LoginpopupComponent implements OnInit {
  currentView = 'inicio';
  form: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    public dialogRef: MatDialogRef<LoginpopupComponent>,
    private fb: FormBuilder
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

  loginWithGoogle() {
    this.authService
      .loginWithGoogle()
      .then(() => {
        this.dialogRef.close();
      })
      .catch((e) => console.log(e.message));
  }

  mostrarFormulario() {
    this.currentView = 'formulario';
  }

  ingresar() {
    this.authService
      .login(this.form.value)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((e) => console.log(e.message));
  }

  crearCuenta() {
    this.authService
      .register(this.form.value)
      .then(() => {
        this.dialogRef.close();
      })
      .catch((e) => console.log(e.message));
  }

  regresar() {
    this.currentView = 'inicio';
  }

  onSubmit() {
    this.ingresar();
  }
}
