import { ModuloDatoSeguroBack } from "../srcJs/ModuloDatoSeguroBack.mjs";
import { General } from "./common/General.mjs";
import { MyStore } from "./common/MyStore.mjs";

const SECRET_TYPE = "secret";

export class SecretsSrv {
    static masterName = "dont_use";
    static masterKey = null;
    static async getMasterKey() {
        if (SecretsSrv.masterKey == null) {
            // Search
            const dbData = await MyStore.readById(SECRET_TYPE, SecretsSrv.masterName);
            if (dbData == undefined) {
                // Debe crear una llave, guardarla y retornarla
                SecretsSrv.masterKey = ModuloDatoSeguroBack.generateKey(15);
                await MyStore.createById(SECRET_TYPE, SecretsSrv.masterName, { val: SecretsSrv.masterKey });
            } else {
                SecretsSrv.masterKey = dbData.val;
            }
            return SecretsSrv.masterKey;
        } else {
            return SecretsSrv.masterKey;
        }
    }
    // SecretsSrv.localRead(["llave1", "llave2"]);
    static async localRead(arg) {
        const master = await SecretsSrv.getMasterKey();
        const response = await MyStore.readByIds(SECRET_TYPE, arg);
        const keys = Object.keys(response);
        const lista = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const payload = response[key];
            const one = { key };
            one.val = ModuloDatoSeguroBack.decifrarSimple(payload.val, master);
            lista.push(one);
        }
        return {
            lista,
            arg,
            master
        };
    }
    // SecretsSrv.localSave({"llave1": "secreto"});
    static async localSave(arg) {
        const master = await SecretsSrv.getMasterKey();
        const keys = Object.keys(arg);
        const promises = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let secreto = arg[key];
            secreto = ModuloDatoSeguroBack.cifrarSimple(secreto, master);
            promises.push(MyStore.createById(SECRET_TYPE, key, { val: secreto }));
        }
        await Promise.all(promises);
        return {
            arg,
            master
        };
    }
    static async read(req, res, next) {
        const ans = {};
        ans.keys = General.readParam(req, "key");
        const response = await SecretsSrv.localRead(ans.keys);
        Object.assign(ans, response);
        res.status(200).json(ans.lista).end();
    }
    static async save(req, res, next) {
        const ans = {};
        ans.keys = General.readParam(req, "key");
        ans.vals = General.readParam(req, "val");
        const myMap = {};
        for (let i = 0; i < ans.keys.length; i++) {
            const key = ans.keys[i];
            myMap[key] = ans.vals[i];
        }
        const response = await SecretsSrv.localSave(myMap);
        Object.assign(ans, response);
        res.status(200).json(ans.keys.length).end();
    }
}