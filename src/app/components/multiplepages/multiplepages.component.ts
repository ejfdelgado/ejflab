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
import { AuthService } from 'src/services/auth.service';
import { User } from '@angular/fire/auth';
import { ModalService } from 'src/services/modal.service';
import { Clipboard } from '@angular/cdk/clipboard';

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

  constructor(
    private fb: FormBuilder,
    private pageSrv: PageService,
    private authSrv: AuthService,
    private modalSrv: ModalService,
    private clipboard: Clipboard
  ) {
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
    this.authSrv.getLoginEvent().subscribe((user: User | null) => {
      this.addOwnership(user);
    });
  }

  get busqueda() {
    return this.form.get('busqueda');
  }

  abrirEnPestaniaNueva(data: CardComponentData) {
    const URL = `${location.origin}${data.href}`;
    window.open(URL, '_blank');
  }

  copiarUrlPortapapeles(data: CardComponentData) {
    const URL = `${location.origin}${data.href}`;
    this.clipboard.copy(URL);
    this.modalSrv.alert({ title: 'Ok!', txt: 'Enlace copiado' });
  }

  async crearNuevaPagina() {
    const dato = await this.pageSrv.createNew();
    const partes = MyRoutes.splitPageData(location.pathname);
    const URL = `${location.origin}${partes.pageType}/${dato.id}`;
    window.open(URL, '_self');
  }

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

  async actionMenuBorrar(item: CardComponentData) {
    const response = await this.modalSrv.confirm({
      title: '¿Está seguro?',
      txt: 'Esta acción no se puede deshacer.',
    });
    if (!response) {
      return;
    }
    await this.pageSrv.delete(item);
    const indice = this.paginas.indexOf(item);
    if (indice >= 0) {
      this.paginas.splice(indice, 1);
      const currentPageId = document
        .getElementById('meta_page_id')
        ?.getAttribute('content');
      if (currentPageId == item.id) {
        // Force reload
        location.reload();
      }
    }
  }

  addOwnership(user: User | null) {
    const idUserActual = user?.email;
    for (let i = 0; i < this.paginas.length; i++) {
      const actual = this.paginas[i];
      actual.owner = idUserActual == actual.usr;
    }
  }

  async buscar(iniciar = true) {
    const promesaUser = this.authSrv.getCurrentUser();
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
        act: dato.act,
        usr: dato.usr,
        id: dato.id,
        owner: false,
      };
      fetch.push(nuevo);
    }
    const actionMenuBorrarThis = this.actionMenuBorrar.bind(this);
    const copiarUrlPortapapelesThis = this.copiarUrlPortapapeles.bind(this);

    if (iniciar) {
      this.paginas.splice(0, this.paginas.length);
    }
    for (let i = 0; i < fetch.length; i++) {
      const actual = fetch[i];
      actual.action = this.abrirEnPestaniaNueva;
      actual.bigColumn = 0;
      // iconos buscar en https://fonts.google.com/icons?icon.query=open&icon.platform=android
      actual.menu = [
        {
          action: this.abrirEnPestaniaNueva,
          texto: 'Abrir',
          icono: 'open_in_new',
          onlyOwner: false,
        },
        {
          action: copiarUrlPortapapelesThis,
          texto: 'Copiar enlace',
          icono: 'share',
          onlyOwner: false,
        },
        {
          action: actionMenuBorrarThis,
          texto: 'Borrar',
          icono: 'close',
          onlyOwner: true,
        },
      ];
      this.paginas.push(actual);
    }
    const user = await promesaUser;
    this.addOwnership(user);
  }
}
