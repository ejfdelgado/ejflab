import { Component, OnInit } from '@angular/core';
import { CardComponentData } from 'src/interfaces/login-data.interface';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-multiplepages',
  templateUrl: './multiplepages.component.html',
  styleUrls: ['./multiplepages.component.css'],
})
export class MultiplepagesComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  cardInicial: CardComponentData = {
    title: 'Crear nueva',
    imageUrl: '/assets/img/app1.jpg',
    action: this.crearNuevaPagina,
  };
  paginas: Array<CardComponentData> = [];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      busqueda: [''],
    });
  }

  get busqueda() {
    return this.form.get('busqueda');
  }

  abrirEnPestaniaNueva(data: CardComponentData) {
    console.log(`abrir ${JSON.stringify(data)}`);
  }

  crearNuevaPagina() {
    console.log('Crear nueva página');
    // POST
    // Reload all page.
  }

  borrarPagina() {}

  async buscar() {
    const busqueda = this.form.value.busqueda;
    console.log(`buscar ${busqueda}`);

    const fetch: Array<CardComponentData> = [
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app1.jpg',
        href: '/customers',
      },
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app2.jpg',
        href: '/customers',
      },
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app3.jpg',
        href: '/customers',
      },
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app1.jpg',
        href: '/customers',
      },
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app2.jpg',
        href: '/customers',
      },
      {
        title: 'Mi título es algo bien largo que no cabe',
        imageUrl: '/assets/img/app3.jpg',
        href: '/customers',
      },
    ];
    this.paginas.splice(0, this.paginas.length);
    const abrirEnPestaniaNuevaThis = this.abrirEnPestaniaNueva.bind(this);
    for (let i = 0; i < fetch.length; i++) {
      const actual = fetch[i];
      actual.action = abrirEnPestaniaNuevaThis;
      this.paginas.push(actual);
    }
  }
}
