import { Component, HostListener } from '@angular/core';
import { AuthorizationService } from 'src/services/authorization.service';
import { LoginService } from 'src/services/login.service';
import { PageService } from 'src/services/page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private loginSrv: LoginService,
    private pageSrv: PageService,
    private authorizationSrv: AuthorizationService
  ) {}
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    if (event.ctrlKey) {
      switch (event.code) {
        case 'KeyI':
          this.loginSrv.login();
          break;
        case 'KeyQ':
          this.loginSrv.logout();
          break;
        case 'KeyB':
          this.pageSrv.edit();
          break;
        case 'Comma':
          this.authorizationSrv.edit();
          break;
        case 'Period':
          console.log('...');
          break;
        default:
          console.log(event.code);
      }
    }
  }
}
