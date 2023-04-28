import { ModuloDatoSeguro } from 'srcJs/ModuloDatoSeguro';
import pkgCriptoJs from 'crypto-js';
const { AES } = pkgCriptoJs;
import Utf8 from "crypto-js/enc-utf8.js";

const random = document.getElementById('meta_random')?.getAttribute('content');
const custom = document.getElementById('meta_custom')?.getAttribute('content');
const defifrado = ModuloDatoSeguro.decifrarSimple(custom, random, AES, Utf8);

export const environment = {
  firebase: defifrado,
  production: true,
};
