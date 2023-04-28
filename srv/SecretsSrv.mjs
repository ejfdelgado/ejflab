import { ModuloDatoSeguroBack } from "../srcJs/ModuloDatoSeguroBack.mjs";
import { MyStore } from "./common/MyStore.mjs";

const SECRET_TYPE = "secret";

export class SecretsSrv {
    static masterName = "dont_use";
    static masterKey = null;
    static async getMasterKey() {
        if (SecretsSrv.masterKey == null) {
            // Search
            const response = await MyStore.readById(SECRET_TYPE, SecretsSrv.masterName);
            if (response == undefined) {
                // Debe crear una llave, guardarla y retornarla
                //ModuloDatoSeguroBack
            }
        }
        return null;
    }
    async localRead(myList) {

    }
    async localSave(myList) {

    }
    static async read(req, res, next) {
        const ans = {};
        ans.master = await SecretsSrv.getMasterKey();
        res.status(200).json(ans).end();
    }
    static async save(req, res, next) {
        const ans = {};
        ans.master = await SecretsSrv.getMasterKey();
        res.status(200).json(ans).end();
    }
}