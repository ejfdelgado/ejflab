import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { StepGeneric } from "./StepGeneric.mjs";

export class StepWriteDB extends StepGeneric {
    constructor(context, io, socket, nodeId) {
        super(context, io, socket, nodeId);
    }

    replace(command, value) {
        return command.replace(/writedb\s*\(([^)]+)\)$/g, ` ${value} `);
    }

    async handle(command, conditionalEngine) {
        const databaseClient = await this.context.getDataBaseClient();
        const tokensWriteDB = /\s*writedb\s*\(([^)]+)\)/.exec(command);
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
                item.puntaje_id = playerContet?.db?.scoreId
                item.participante_id = playerContet?.db?.participante_id
                item.socketId = playerContet?.db?.socketId;
                arregloJugadores.push(item);
            }
            // Se hace iteración cruzada
            if (arregloJugadores.length > 0) {
                if (arregloJugadores.length == 1) {

                    // Se guarda el participante #1 sin pareja
                    await databaseClient.updateScoreFromMap(arregloJugadores[0].puntaje_id, mapa);
                } else if (arregloJugadores.length >= 2) {
                    const participante1 = arregloJugadores[0];
                    const participante2 = arregloJugadores[1];

                    // Se guarda el participante #1 con pareja el participante #2
                    mapa.puntaje_pareja = participante2.participante_id;
                    await databaseClient.updateScoreFromMap(participante1.puntaje_id, mapa);

                    // Se guarda el participante #2 con pareja el participante #1
                    mapa.puntaje_pareja = participante1.participante_id;
                    await databaseClient.updateScoreFromMap(participante2.puntaje_id, mapa);
                }
            }

            return this.replace(command, "true");
        }
        // Este step no es el encargado de hacer nada
        return false;
    }
}