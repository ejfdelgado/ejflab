import { Component, OnInit } from '@angular/core';

export interface MiMes {
  txt: string;
  semanas: number;
  fila: number;
}

export interface MiDia {
  txt: string;
  fds?: boolean;
  fes?: boolean;
  sad?: boolean;
  happy?: boolean;
  happyjoyce?: boolean;
  hoy?: boolean;
  jardin?: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  anio: number = 2023;
  esPar: boolean = true;
  weekEven: boolean = true;
  titulos: Array<MiMes> = [];
  dias: Array<MiDia> = [];
  festivos: { [key: number]: { [key: number]: { [key: number]: boolean } } } = {
    2022: {},
    2024: {},
    2023: {
      //Enero
      1: { 1: true, 9: true },
      //Febrero 2
      2: {},
      //Marzo 3
      3: { 20: true },
      //Abril 4
      4: { 6: true, 7: true },
      //Mayo 5
      5: { 1: true, 22: true },
      //Junio 6
      6: { 12: true, 19: true },
      // Julio 7
      7: { 3: true, 20: true },
      // Agosto 8
      8: { 7: true, 21: true },
      // Septiembre 9
      9: {},
      // Octubre 10
      10: { 16: true },
      11: { 6: true, 13: true },
      12: { 8: true, 25: true },
    },
  };
  jardin: { [key: number]: { [key: number]: { [key: number]: boolean } } } = {
    2023: {
      1: { 27: true }, //entrega de boletines
      2: { 28: true }, //jornada pedagogica
      3: { 17: true, 27: true, 28: true, 29: true, 30: true, 31: true }, //entrega de boletines
      4: { 3: true, 4: true, 5: true, 6: true, 7: true, 10: true },
    },
  };
  constructor() {}

  weekOfYear(fecha: Date) {
    const currentDate = fecha.getTime();
    const startDate = new Date(fecha.getFullYear(), 0, 1).getTime();
    var days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  }

  weekCount(year: number, monthNumber: number): number {
    // monthNumber is in the range 1..12
    const firstOfMonth = new Date(year, monthNumber - 1, 1);
    const lastOfMonth = new Date(year, monthNumber, 0);

    const a = this.weekOfYear(firstOfMonth);
    const b = this.weekOfYear(lastOfMonth);

    //console.log(`${firstOfMonth} is ${a} ${lastOfMonth} is ${b}`);

    let ans = b - a + 1;

    if (monthNumber == 12) {
      return ans;
    }

    if (lastOfMonth.getDay() != 0) {
      // Día diferente a domingo
      ans = ans - 1;
    }
    return ans;
  }

  ngOnInit(): void {
    const TITULOS = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    let conteoSemanas = 1;
    for (let i = 1; i <= 12; i++) {
      const nuevo: MiMes = {
        txt: TITULOS[i - 1],
        semanas: this.weekCount(this.anio, i),
        fila: conteoSemanas,
      };
      conteoSemanas += nuevo.semanas;
      this.titulos.push(nuevo);
    }

    let inicio = new Date(this.anio, 0, 1);
    const final = new Date(this.anio, 11, 31);

    if (inicio.getDay() != 1) {
      //Si es diferente de lunes toca rellenar
      let offset = 0;
      if (inicio.getDay() == 0) {
        offset = 6;
      } else {
        offset = inicio.getDay() - 1;
      }
      inicio = new Date(this.anio, 0, 1 - offset);
    }

    const hoy = new Date();
    const hoyAnio = hoy.getFullYear();
    const hoyMes = hoy.getMonth() + 1;
    const hoyElDia = hoy.getDate();

    for (let d = inicio; d <= final; d.setDate(d.getDate() + 1)) {
      const dia: MiDia = {
        txt: '' + d.getDate(),
        fds: [0, 6].indexOf(d.getDay()) >= 0, // domingo o sabado
      };
      const anio = d.getFullYear();
      const mes = d.getMonth() + 1;
      const elDia = d.getDate();

      if (this.esPar && elDia % 2 != 0) {
        dia.sad = true;
      } else {
        dia.happy = true;
      }

      if (anio == hoyAnio && mes == hoyMes && elDia == hoyElDia) {
        dia.hoy = true;
      }

      if ([0, 5, 6].indexOf(d.getDay()) >= 0) {
        //viernes, sabado o domingo
        const numWeek = this.weekOfYear(d);
        if (this.weekEven) {
          dia.happyjoyce = numWeek % 2 == 0;
        } else {
          dia.happyjoyce = numWeek % 2 != 0;
        }
        if (!dia.happyjoyce) {
          dia.happy = false;
        }
      }

      const p1 = this.festivos[anio];
      if (p1) {
        const p2 = p1[mes];
        if (p2) {
          const esFestivo = p2[elDia];
          if (esFestivo) {
            dia.fes = true;
          }
        }
      }

      const j1 = this.jardin[anio];
      if (j1) {
        const j2 = j1[mes];
        if (j2) {
          const esJardin = j2[elDia];
          if (esJardin) {
            dia.jardin = true;
          }
        }
      }
      this.dias.push(dia);
    }
  }
}
