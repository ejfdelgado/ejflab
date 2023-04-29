import { Component, HostListener } from '@angular/core';
import { AuthorizationService } from 'src/services/authorization.service';
import { LoginService } from 'src/services/login.service';
import { PageService } from 'src/services/page.service';
import { PayuService } from 'src/services/payu.service';
import { MyUserService } from 'src/services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private loginSrv: LoginService,
    private pageSrv: PageService,
    private authorizationSrv: AuthorizationService,
    private usrSrv: MyUserService,
    private payuSrv: PayuService
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
          this.pageSrv.multiple();
          break;
        case 'Enter':
          this.usrSrv.edit();
          break;
        case 'Backquote':
          //El pipe | arriba a la izquierda
          break;
        case 'NumpadEnter':
          this.payuSrv.openConfiguration();
          break;
        default:
          console.log(event.code);
      }
    }
  }
}
