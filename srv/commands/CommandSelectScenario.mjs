import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandSelectScenario extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("selectScenario", payload, this.io, this.socket);
        const modelo = await this.context.state.loadState(payload.name, this.context.ROOT_FOLDER);

        await this.context.reloadVoiceHelpers(modelo?.scene?.homologacion_voz || "homologacion_voz.json", modelo?.scene?.sinonimos_voz || "caso1_sinonimos_voz.json");
        // Se envia la raíz del estado para ser reemplazado.
        // Se recrea el estado inicial de cada avatar
        const clients = this.context.clients;
        for (let i = 0; i < clients.length; i++) {
            const clientSocketId = clients[i];
            SimpleObj.recreate(modelo, `avatar.${clientSocketId}`, JSON.parse(JSON.stringify(this.context.INITIAL_AVATAR_VALUE)), false);
        }
        this.io.emit('stateChanged', JSON.stringify({
            key: "",
            val: modelo
        }));
    }
}