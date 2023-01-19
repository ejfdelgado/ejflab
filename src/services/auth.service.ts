import { Injectable, EventEmitter } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  getIdToken,
} from '@angular/fire/auth';
import { LoginData } from '../interfaces/login-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  evento: EventEmitter<User | null>;
  promesa: Promise<User | null>;

  constructor(private auth: Auth) {
    this.evento = new EventEmitter<User | null>();
    this.promesa = new Promise((resolve) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.evento.emit(user);
          resolve(user);
          this.promesa = Promise.resolve(user);
        } else {
          this.evento.emit(null);
          resolve(null);
          this.promesa = Promise.resolve(null);
        }
      });
    });
  }

  getLoginEvent() {
    return this.evento;
  }

  async getIdToken() {
    let user = await this.getCurrentUser();
    if (user != null) {
      return getIdToken(user);
    } else {
      return null;
    }
  }

  getCurrentUser() {
    return this.promesa;
  }

  login({ email, password }: LoginData) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register({ email, password }: LoginData) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async logout() {
    await signOut(this.auth);
    this.promesa = Promise.resolve(null);
  }
}
