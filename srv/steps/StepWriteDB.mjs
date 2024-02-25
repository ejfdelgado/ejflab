import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { StepGeneric } from "./StepGeneric.mjs";

export class StepWriteDB extends StepGeneric {
    constructor(context, io, socket, nodeId) {
        super(context, io, socket, nodeId);
    }

    replace(command, value) {
        return command.replace(/writedb\s*\(([^)]+)\)$/g, value);
    }

    async handle(command, conditionalEngine) {
        const tokensWriteDB = /^\s*writedb\s*\(([^)]+)\)$/.exec(command);
        if (tokensWriteDB != null) {
            const configFileText = tokensWriteDB[1];
            const path = `${this.context.ROOT_FOLDER}${configFileText}`;
            //console.log(`Reading ${path}`);
            const configFileUnparsed = await this.context.state.proxyReadFile(path);
            const configFile = JSON.parse(configFileUnparsed);
            const { table, id, config } = configFile;
            const mapa = SimpleObj.transFromModel(this.context.state.estado, config);
            //console.log(JSON.stringify(mapa));
            const players = this.context.state.readKey("players");
            // Se deben iterar todos los jugadores y conseguir el id...
            const playersKeys = Object.keys(players);
            const arregloJugadores = [];
            for (let i = 0; i < playersKeys.length; i++) {
                const playerKey = playersKeys[i];
                const playerContet = players[playerKey];
                const item = {};
                item.puntaje_id = playerContet.db.scoreId
                item.participante_id = playerContet.db.participante_id
                arregloJugadores.push(item);
            }

            await databaseClient.updateScoreFromMap(insertedId, mapa);
            return this.replace(command, "true");
        }
        // Este step no es el encargado de hacer nada
        return false;
    }
}