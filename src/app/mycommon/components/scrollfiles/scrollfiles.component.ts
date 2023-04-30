import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-scrollfiles',
  templateUrl: './scrollfiles.component.html',
  styleUrls: ['./scrollfiles.component.css'],
})
export class ScrollfilesComponent implements OnInit {
  archivos: Array<any> = [
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
    { name: 'quepasasiestenombredearchivoesmuygrandeynocabe1.csv', url: '/ruta/a/archivo1.csv' },
    { name: 'Archivo2.csv', url: '/ruta/a/archivo2.csv' },
    { name: 'Archivo3.csv', url: '/ruta/a/archivo3.csv' },
  ];
  constructor() {}

  ngOnInit(): void {}

  uploadFile() {}
}
