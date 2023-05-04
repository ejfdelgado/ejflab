import { Component, Input, OnInit } from '@angular/core';
import { faBurger, faUser } from '@fortawesome/free-solid-svg-icons';
import { AuthorizationService } from 'src/services/authorization.service';
import { LoginService } from 'src/services/login.service';
import { PageService } from 'src/services/page.service';
import { MyUserService } from 'src/services/user.service';
import { MyRoutes } from 'srcJs/MyRoutes';

export interface OptionData {
  icon: string;
  label: string;
  action: Function;
}

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.css'],
})
export class StatusbarComponent implements OnInit {
  faBurgerIcon = faBurger;
  faUserIcon = faUser;
  @Input('title')
  title: string | null;
  @Input('extraOptions')
  extraOptions: Array<OptionData> = [];

  constructor(
    private loginSrv: LoginService,
    private pageSrv: PageService,
    private authorizationSrv: AuthorizationService,
    private usrSrv: MyUserService
  ) {}

  ngOnInit(): void {}

  async editPage() {
    this.pageSrv.edit();
  }

  async editPagePermisions() {
    this.authorizationSrv.edit();
  }

  async createNewPage() {
    const dato = await this.pageSrv.createNew();
    const partes = MyRoutes.splitPageData(location.pathname);
    const URL = `${location.origin}${partes.pageType}/${dato.id}`;
    window.open(URL, '_self');
  }

  async lookMyPages() {
    this.pageSrv.multiple();
  }

  async goToHome() {

  }

  async logoutAndGoToHome() {
    await this.loginSrv.logout();
  }

  async editUser() {
    this.usrSrv.edit();
  }

  async logout() {
    this.loginSrv.logout();
  }

  async login() {
    this.loginSrv.login();
  }
}
