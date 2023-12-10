import fs from "fs";
import { SimpleObj } from "../srcJs/SimpleObj.js";

export class UnrealEngineState {
    estado = {};
    loadState(id) {
        const data = fs.readFileSync(`./data/ue/scenes/${id}.json`, 'utf8');
        this.estado = JSON.parse(data);
        return this.estado;
    }
    writeKey(key, val) {
        SimpleObj.recreate(this.estado, key, val, true);
    }
    readKey(key) {
        return SimpleObj.getValue(this.estado, key);
    }
}