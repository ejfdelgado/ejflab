
import { ModuloDatoSeguro } from "../srcJs/ModuloDatoSeguro.js";
import { MyDates } from "../srcJs/MyDates.js";
import { General } from "./common/General.mjs";
import { MyStore } from "./common/MyStore.mjs";

const KEYS_TYPE = "page-key";
const DEFAULT_KEY_SIZE = 10;

export class KeysSrv {

    static getDates() {
        const hoy = new Date();
        const manana = new Date(hoy.getTime());
        manana.setDate(manana.getDate() + 1);
        const ayer = new Date(hoy.getTime());
        ayer.setDate(ayer.getDate() - 1);
        const actual = MyDates.getDayAsContinuosNumber(hoy);
        const siguiente = MyDates.getDayAsContinuosNumber(manana);
        const anterior = MyDates.getDayAsContinuosNumber(ayer);
        return {
            actual,
            siguiente,
            anterior,
        };
    }

    static async getOrGeneratePageKeys(pageId) {
        // Cada página debe tener algo como esto:
        const {
            actual,
            siguiente,
            anterior,
        } = KeysSrv.getDates();

        // Busco el registro por pageId
        const response = await MyStore.readById(KEYS_TYPE, pageId);
        const payload = {};
        if (!response) {
            // Toca crearlo desde ceros todo
            payload[actual] = ModuloDatoSeguro.generateKey(DEFAULT_KEY_SIZE);
            payload[siguiente] = ModuloDatoSeguro.generateKey(DEFAULT_KEY_SIZE);
            payload[anterior] = ModuloDatoSeguro.generateKey(DEFAULT_KEY_SIZE);
            await MyStore.createById(KEYS_TYPE, pageId, payload);
        } else {
            payload[actual] = response[actual];
            payload[siguiente] = response[siguiente];
            payload[anterior] = response[anterior];
            let modificado = false;
            if (!(actual in payload)) {
                payload[actual] = ModuloDatoSeguro.generateKey();
                modificado = true;
            }
            if (!(siguiente in payload)) {
                payload[siguiente] = ModuloDatoSeguro.generateKey();
                modificado = true;
            }
            if (!(anterior in payload)) {
                payload[anterior] = ModuloDatoSeguro.generateKey();
                modificado = true;
            }
            if (modificado) {
                await MyStore.updateById(KEYS_TYPE, pageId, payload);
            }
        }
        return payload;
    }

    static async cifrar(objeto, pageId) {
        const llavero = await KeysSrv.getOrGeneratePageKeys(pageId);
        const actual = MyDates.getDayAsContinuosNumber(new Date());
        const pass = llavero[actual];
        const resultado = ModuloDatoSeguro.cifrar(objeto, pass);
        return resultado;
    }

    static async decifrar(texto, pageId) {
        const llavero = await KeysSrv.getOrGeneratePageKeys(pageId);
        const {
            actual,
            siguiente,
            anterior,
        } = KeysSrv.getDates();
        let resultado = undefined;
        const llaves = [];
        llaves.push(llavero[actual]);
        llaves.push(llavero[anterior]);
        llaves.push(llavero[siguiente]);
        for (let i = 0; i < llaves.length; i++) {
            const llave = llaves[i];
            try {
                resultado = ModuloDatoSeguro.decifrar(texto, llave);
            } catch (e) {

            }
        }
        return resultado;
    }

    static async getPageKeys(req, res, next) {
        // Solo se entregan las llaves si tiene permiso
        const pageId = General.readParam(req, "id");
        const llavero = await KeysSrv.getOrGeneratePageKeys(pageId);
        /*
        const prueba = { valor: "edgar", otro: false };
        const cifrado = await KeysSrv.cifrar(prueba, pageId);
        const decifrado = await KeysSrv.decifrar(cifrado, pageId);
        console.log(`cifrado=${cifrado}`);
        console.log(`decifrado=${JSON.stringify(decifrado)}`);
        */
        res.status(200).send(llavero);
    }

    static async cifrarWeb(req, res, next) {
        // Solo se entregan las llaves si tiene permiso
        const key = General.readParam(req, "key");
        const payload = General.readParam(req, "payload");
        const resultado = ModuloDatoSeguro.cifrar(payload, key);
        console.log(resultado);
        res.status(200).send(resultado);
    }

    static async decifrarWeb(req, res, next) {
        // Solo se entregan las llaves si tiene permiso
        const key = General.readParam(req, "key");
        const payload = General.readParam(req, "payload");
        const resultado = ModuloDatoSeguro.decifrar(payload, key);
        res.status(200).send(resultado);
    }
}
