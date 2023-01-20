import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  IndicatorPayload,
  IndicatorService,
} from 'src/services/indicator.service';

@Component({
  selector: 'app-indicator',
  templateUrl: './indicator.component.html',
  styleUrls: ['./indicator.component.css'],
})
export class IndicatorComponent implements OnInit {
  isLoading: boolean = false;
  constructor(
    private cdr: ChangeDetectorRef,
    private indicatorSrv: IndicatorService
  ) {}

  ngOnInit(): void {
    const actualizarEstadoThis = this.actualizarEstado.bind(this);
    this.indicatorSrv.subscribe(actualizarEstadoThis);
  }

  private actualizarEstado(payload: IndicatorPayload) {
    this.isLoading = payload.loading;
    this.cdr.detectChanges();
  }
}
