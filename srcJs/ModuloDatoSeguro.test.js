//const { ModuloDatoSeguro } = require('./ModuloDatoSeguro.js');
const NodeRSA = require('node-rsa');

const fs = require('fs');
const { ModuloDatoSeguro } = require('./ModuloDatoSeguro');
const { ModuloDatoSeguroBack } = require('./ModuloDatoSeguroBack');

const test = () => {
    //https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256
    const dato = "edgar jose fernando";
    const clave = ModuloDatoSeguro.generateKey(4);
    const encriptado = ModuloDatoSeguro.cifrar(dato, clave);
    console.log(encriptado);
    const desencriptado = ModuloDatoSeguro.decifrar(encriptado, clave);
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