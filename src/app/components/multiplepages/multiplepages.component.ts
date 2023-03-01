import { Component, OnInit } from '@angular/core';
import { CardComponentData } from 'src/interfaces/login-data.interface';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  PageData,
  PageIteratorData,
  PageService,
} from 'src/services/page.service';
import { MyRoutes } from 'srcJs/MyRoutes';

@Component({
  selector: 'app-multiplepages',
  templateUrl: './multiplepages.component.html',
  styleUrls: ['./multiplepages.component.css'],
})
export class MultiplepagesComponent implements OnInit {
  faXmark = faXmark;
  form: FormGroup;
  cardInicial: CardComponentData;
  paginas: Array<CardComponentData> = [];
  iterador: PageIteratorData | null = null;
  onlyMyPages: boolean = true;

  constructor(private fb: FormBuilder, private pageSrv: PageService) {
    const crearNuevaPaginaThis = this.crearNuevaPagina.bind(this);
    this.cardInicial = {
      title: 'Crear nueva',
      imageUrl: '/assets/img/add.jpg',
      action: crearNuevaPaginaThis,
    };
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      busqueda: [''],
    });
    this.buscar();
  }

  get busqueda() {
    return this.form.get('busqueda');
  }

  abrirEnPestaniaNueva(data: CardComponentData) {
    const URL = `${location.origin}${data.href}`;
    window.open(URL, '_blank');
  }

  async crearNuevaPagina() {
    const dato = await this.pageSrv.createNew();
    const partes = MyRoutes.splitPageData(location.pathname);
    const URL = `${location.origin}${partes.pageType}/${dato.id}`;
    window.open(URL, '_self');
  }

  borrarPagina() {}

  setOnlyMyPagesOn() {
    if (!this.onlyMyPages) {
      this.onlyMyPages = true;
      this.buscar();
    }
  }
  setOnlyMyPagesOff() {
    if (this.onlyMyPages) {
      this.onlyMyPages = false;
      this.buscar();
    }
  }

  actionMenuBorrar(item: any) {
    console.log('Borrar' + JSON.stringify(item));
  }

  async buscar(iniciar = true) {
    const busqueda = this.form.value.busqueda;
    if (iniciar || this.iterador == null) {
      if (this.onlyMyPages) {
        this.iterador = this.pageSrv.getReaderMines(busqueda);
      } else {
        this.iterador = this.pageSrv.getReaderAll(busqueda);
      }
    }
    const datos: Array<PageData> = await this.iterador.next();
    const fetch: Array<CardComponentData> = [];
    const partes = MyRoutes.splitPageData(location.pathname);
    for (let i = 0; i < datos.length; i++) {
      const dato = datos[i];
      const nuevo: CardComponentData = {
        imageUrl: dato.img,
        title: dato.tit,
        href: `${partes.pageType}/${dato.id}`,
        profile: '/assets/img/profile.jpeg',
      };
      fetch.push(nuevo);
    }
    const abrirEnPestaniaNuevaThis = this.abrirEnPestaniaNueva.bind(this);
    const actionMenuBorrarThis = this.actionMenuBorrar.bind(this);

    if (iniciar) {
      this.paginas.splice(0, this.paginas.length);
    }
    for (let i = 0; i < fetch.length; i++) {
      const actual = fetch[i];
      actual.action = abrirEnPestaniaNuevaThis;
      actual.bigColumn = 0;
      actual.menu = [
        {
          action: actionMenuBorrarThis,
          texto: 'Borrar',
          icono: 'close',
        },
      ];
      this.paginas.push(actual);
    }
  }
}
