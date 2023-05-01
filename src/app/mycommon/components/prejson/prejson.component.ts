import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-prejson',
  templateUrl: './prejson.component.html',
  styleUrls: ['./prejson.component.css'],
})
export class PrejsonComponent implements OnInit {
  @Input('model')
  model: any;
  constructor() {}

  ngOnInit(): void {}
}
