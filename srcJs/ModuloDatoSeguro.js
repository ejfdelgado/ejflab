
// ¿Cómo generar las llaves públicas y privadas?

//1. Se genera el par:
//openssl genrsa -out local_par.pem 256
//2. Se genera la llave pública:
//openssl rsa -in local_par.pem -pubout -out local_publica.crt
//3. Se genera la llave privada:
//openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key

//openssl genrsa -out local_par.pem 256 && openssl rsa -in local_par.pem -pubout -out local_publica.crt && openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key
//openssl genrsa -out local_par.pem 2048 && openssl rsa -in local_par.pem -pubout -out local_publica.crt && openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in local_par.pem -out local_privada.key
//openssl req -new -x509 -key local_privada.key -out local_publica.cer
//openssl x509 -in local_publica.crt -out local_publica.pem -outform PEM

//const AES = require("crypto-js/aes");
//const Utf8 = require("crypto-js/enc-utf8");

class ModuloDatoSeguro {
  // create a key for symmetric encryption
  // pass in the desired length of your key
  static generateKey = (keyLength = 10) => {
    // define the characters to pick from
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz*&-%/!?*+=()";
    let randomstring = "";
    for (let i = 0; i < keyLength; i++) {
      const rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  };

  static cifrarSimple(objeto, llave, AES) {
    const texto = JSON.stringify(objeto);
    const encriptado = AES.encrypt(texto, llave);
    return encriptado.toString();
  }
  static decifrarSimple(texto, llave, AES, Utf8) {
    const desencriptado = AES.decrypt(texto, llave).toString(Utf8);
    return JSON.parse(desencriptado);
  }
  static decifrarConListaDeLlaves(texto, llaves) {
    for (let i = 0; i < llaves.length; i++) {
      try {
        const llave = llaves[i];
        const temp = ModuloDatoSeguro.decifrar(texto, llave);
        return temp;
      } catch (err) { }
    }
    return undefined;
  }
}

module.exports = {
  ModuloDatoSeguro
};