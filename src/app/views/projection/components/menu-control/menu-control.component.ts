import { Component, Input, OnInit } from '@angular/core';
import { GlobalModelData } from '../../projection.component';

@Component({
  selector: 'app-menu-control',
  templateUrl: './menu-control.component.html',
  styleUrls: ['./menu-control.component.css'],
})
export class MenuControlComponent implements OnInit {
  @Input() mymodel: GlobalModelData;
  constructor() {}

  ngOnInit(): void {}
}
