import { Component, Input, OnInit } from '@angular/core';
import { faBurger, faUser } from '@fortawesome/free-solid-svg-icons';

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
  @Input('extraOptions')
  extraOptions: Array<OptionData> = [];

  constructor() {}

  ngOnInit(): void {}
}
