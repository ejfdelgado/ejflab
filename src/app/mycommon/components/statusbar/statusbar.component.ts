import { Component, OnInit } from '@angular/core';
import { faBurger, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.css'],
})
export class StatusbarComponent implements OnInit {
  faBurgerIcon = faBurger;
  faUserIcon = faUser;

  constructor() {}

  ngOnInit(): void {}
}
