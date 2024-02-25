import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandCreateScore extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("createScore", payload, this.io, this.socket);
        const databaseClient = await this.context.getDataBaseClient();
        // Debe existir primero el escenario seleccionado
        if (!(this.context.state.estado?.scene?.id)) {
            throw "Debe seleccionar primero el escenario";
        }

        // Se verifica si ya existe uno anterior...
        const currentKey = this.context.getCurrentPlayerKey(this.socket);
        if (currentKey != null) {
            this.context.affectModel(currentKey, undefined, this.io);
        }

        const insertedId = await databaseClient.createScore(payload.personId, this.context.state.estado.scene?.id);
        // const created = await databaseClient.readScore(insertedId);
        const configTransform = [
            { orig: "sexo", dest: "puntaje_sexo", def: null },
            { orig: "grado", dest: "puntaje_grado", def: null },
            { orig: "biotipo", dest: "puntaje_biotipo", def: null },
            { orig: "etnia", dest: "puntaje_etnia", def: null },
        ];
        const mapa = SimpleObj.transFromModel(payload, configTransform);
        await databaseClient.updateScoreFromMap(insertedId, mapa);
        const participant = await databaseClient.readParticipant(payload.personId);

        // Escribir en el estado
        // el modelo
        participant.scoreId = insertedId;
        participant.socketId = this.socket.id;

        //console.log(JSON.stringify(participant, null, 4));
        const keyWrited = `players.player_${insertedId}`;
        this.context.affectModel(keyWrited, { db: participant }, this.io);
    }
}