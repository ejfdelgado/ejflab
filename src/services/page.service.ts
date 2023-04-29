import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MultiplepagesComponent } from 'src/app/components/multiplepages/multiplepages.component';

import { PagepopupComponent } from 'src/app/components/pagepopup/pagepopup.component';
import { CardComponentData } from 'src/interfaces/login-data.interface';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { ModalService } from './modal.service';

export interface PageIteratorData {
  next: Function;
}

export interface PageData {
  date?: number;
  usr?: string;
  tit?: string;
  q?: Array<string>;
  path?: string;
  act?: number;
  desc?: string;
  img?: string;
  kw?: string;
  id?: string;
  profile?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PageService {
  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private dialog: MatDialog,
    private httpService: HttpService
  ) {}

  async edit() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.dialog.open(PagepopupComponent);
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }

  getReaderMines(q: string): PageIteratorData {
    return this.getReader(q, 'srv/pg/mines');
  }
  getReaderAll(q: string): PageIteratorData {
    return this.getReader(q, 'srv/pg/all');
  }
  async createNew(): Promise<PageData> {
    const payload = {};
    const response = await this.httpService.post<PageData>(
      `srv/pg/new`,
      payload,
      {
        showIndicator: true,
      }
    );
    if (response == null) {
      throw Error('No se pudo crear la página');
    }
    return response;
  }
  async delete(page: CardComponentData): Promise<boolean> {
    const response = await this.httpService.delete<null>(`srv/${page.id}/pg`, {
      showIndicator: true,
    });
    return true;
  }
  getReader(q: string, prefix: string): PageIteratorData {
    let offset = 0;
    const max = 30;
    const partes = /^(\/[^/]+)/.exec(location.pathname);
    if (partes == null) {
      throw Error('El path está mal');
    }
    const path = partes[0];
    return {
      next: async (): Promise<Array<PageData>> => {
        const response = await this.httpService.get<Array<PageData>>(
          `${prefix}?offset=${offset}&max=${max}&q=${encodeURIComponent(
            q
          )}&path=${encodeURIComponent(path)}`,
          { showIndicator: true }
        );
        if (response != null) {
          offset += response.length;
          return response;
        }
        return [];
      },
    };
  }

  async multiple() {
    const usuario = await this.authService.getCurrentUser();
    if (usuario) {
      this.dialog.open(MultiplepagesComponent, {
        panelClass: 'search-pages-dialog-container',
      });
    } else {
      this.modalService.alert({ txt: 'No hay usuario autenticado' });
    }
  }
}
