import { Component, HostListener } from '@angular/core';
import { LoginService } from 'src/services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private loginSrv:  LoginService) {

  }
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey) {
      switch (event.code) {
        case 'KeyI':
          console.log('Login');
          this.loginSrv.login();
          break;
        case 'KeyQ':
          console.log('Logout');
          this.loginSrv.logout();
          break;
        default:
      }
    }
  }
}
