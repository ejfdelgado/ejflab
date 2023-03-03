import { ModuloDatoSeguro } from 'srcJs/ModuloDatoSeguro';

const random = document.getElementById('meta_random')?.getAttribute('content');
const custom = document.getElementById('meta_custom')?.getAttribute('content');
const defifrado = ModuloDatoSeguro.decifrar(custom, random);

export const environment = {
  firebase: defifrado,
  production: true,
};
