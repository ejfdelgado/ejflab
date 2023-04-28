//const { ModuloDatoSeguro } = require('./ModuloDatoSeguro.js');
//const NodeRSA = require('node-rsa');
//const fs = require('fs');

import { ModuloDatoSeguroBack } from "./ModuloDatoSeguroBack.mjs";

//const { ModuloDatoSeguroBack } = require('./ModuloDatoSeguroBack');

const test = () => {
    //https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
    const dato = "edgar jose fernando";
    const clave = ModuloDatoSeguroBack.generateKey(4);
    const encriptado = ModuloDatoSeguroBack.cifrarSimple(dato, clave);
    console.log(encriptado);
    const desencriptado = ModuloDatoSeguroBack.decifrarSimple(encriptado, clave);
    console.log(dato + "=>" + encriptado + '=>' + desencriptado);
}

const test2 = () => {
    const par = ModuloDatoSeguroBack.generateKeyPair();
    const prueba = { valor: "edgar" };
    const cifrado = ModuloDatoSeguroBack.cifrar(prueba, par.public);
    console.log(cifrado);
    const decifrado = ModuloDatoSeguroBack.decifrar(cifrado, par.private);
    console.log(decifrado);
}

test();