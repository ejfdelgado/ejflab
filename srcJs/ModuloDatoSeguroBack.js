const NodeRSA = require('node-rsa');
const AES = require("crypto-js/aes");
const Utf8 = require("crypto-js/enc-utf8");
const { ModuloDatoSeguro } = require('./ModuloDatoSeguro');

class ModuloDatoSeguroBack {
    static SCHEMES = ["pkcs1", "pkcs8", "openssh"];
    static KEY_TYPES = ["public", "private"];
    static scheme_default = ModuloDatoSeguroBack.SCHEMES[0];

    static generateKeyPair = (tamanio = 512) => {
        const key = new NodeRSA({ b: tamanio });
        key.setOptions({ encryptionScheme: ModuloDatoSeguroBack.scheme_default });
        const respose = {
            public: key.exportKey(`${ModuloDatoSeguroBack.SCHEMES[0]}-${ModuloDatoSeguroBack.KEY_TYPES[0]}-pem`),
            private: key.exportKey(`${ModuloDatoSeguroBack.SCHEMES[0]}-${ModuloDatoSeguroBack.KEY_TYPES[1]}-pem`),
        };
        return respose;
    };
    static cifrar = function (objeto, llavePublica) {
        llavePublica = llavePublica.replace('\n', '');
        const miniKey = ModuloDatoSeguro.generateKey(10);
        const format = `${ModuloDatoSeguroBack.scheme_default}-${ModuloDatoSeguroBack.KEY_TYPES[0]}-pem`;
        const key = new NodeRSA(llavePublica, format);
        const encryptedKey = key.encrypt(miniKey, 'base64');
        const texto = JSON.stringify(objeto);
        const aesEncrypted = AES.encrypt(texto, miniKey);
        const encryptedMessage = aesEncrypted.toString();
        return Buffer.from(JSON.stringify({
            llave: encryptedKey,
            mensaje: encryptedMessage,
        })).toString("base64");

    }
    static decifrar = function (texto, llavePrivada) {
        llavePrivada = llavePrivada.replace('\n', '');
        const parametroSinBase64 = JSON.parse(Buffer.from(texto, "base64"));
        const key = new NodeRSA(llavePrivada, `${ModuloDatoSeguroBack.scheme_default}-${ModuloDatoSeguroBack.KEY_TYPES[1]}-pem`);
        const llaveDesencriptada = key.decrypt(parametroSinBase64["llave"], 'utf8');
        var desencriptado = AES.decrypt(
            parametroSinBase64["mensaje"],
            llaveDesencriptada
        ).toString(Utf8);
        return JSON.parse(desencriptado);
    }
}

module.exports = {
    ModuloDatoSeguroBack
};