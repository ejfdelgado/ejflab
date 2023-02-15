import { Component, OnInit } from '@angular/core';
import { CardComponentData } from 'src/interfaces/login-data.interface';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  PageData,
  PageIteratorData,
  PageService,
} from 'src/services/page.service';

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
  iterador: PageIteratorData | null = null;

  constructor(private fb: FormBuilder, private pageSrv: PageService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      busqueda: [''],
    });
  }

  get busqueda() {
    return this.form.get('busqueda');
  }

  abrirEnPestaniaNueva(data: CardComponentData) {
    const URL = `${location.origin}${data.href}`;
    console.log(URL);
    //window.open(URL, '_blank');
  }

  crearNuevaPagina() {
    console.log('Crear nueva página');
    // POST
    // Reload all page.
  }

  borrarPagina() {}

  async buscar() {
    const busqueda = this.form.value.busqueda;
    this.iterador = this.pageSrv.getReaderMines(busqueda);
    const datos: Array<PageData> = await this.iterador.next();
    const fetch: Array<CardComponentData> = [];
    for (let i = 0; i < datos.length; i++) {
      const dato = datos[i];
      const nuevo: CardComponentData = {
        imageUrl: dato.img,
        title: dato.tit,
        href: `${location.pathname}/${dato.id}`,
      };
      fetch.push(nuevo);
    }
    this.paginas.splice(0, this.paginas.length);
    const abrirEnPestaniaNuevaThis = this.abrirEnPestaniaNueva.bind(this);
    for (let i = 0; i < fetch.length; i++) {
      const actual = fetch[i];
      actual.action = abrirEnPestaniaNuevaThis;
      this.paginas.push(actual);
    }
  }
}
