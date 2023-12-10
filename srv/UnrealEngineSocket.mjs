import * as os from "os";
import sortify from "../srcJs/sortify.js";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";
import { UnrealEngineState } from "./UnrealEngineState.mjs";
import { serializeError } from 'serialize-error';

const chatEvent = "chatMessage";
const buscarParticipantesEvent = "buscarParticipantes";
const createScoreEvent = "createScore";
const updateScoreEvent = "updateScore";
const stateWriteEvent = "stateWrite";
const selectScenarioEvent = "selectScenario";

export class UnrealEngineSocket {

    static clients = [];	//track connected clients
    static databaseClient = null;
    static state = new UnrealEngineState();

    static async getDataBaseClient() {
        if (UnrealEngineSocket.databaseClient == null) {
            UnrealEngineSocket.databaseClient = new PoliciaVrMySql();
            await UnrealEngineSocket.databaseClient.connect();
        } else {
            await UnrealEngineSocket.databaseClient.checkConnection();
        }
        return UnrealEngineSocket.databaseClient;
    }

    static handle(io) {
        io.on("connection", async (socket) => {
            console.log(`Creating room for ${socket.id}`);
            socket.join(socket.id);
        });

        return (socket) => {
            const clients = UnrealEngineSocket.clients;
            // convenience function to log server messages on the client
            // track connected clients via log
            clients.push(socket.id);
            const clientConnectedMsg = 'User connected ' + (socket.id) + ', total: ' + clients.length;
            console.log(clientConnectedMsg);
            io.emit(chatEvent, clientConnectedMsg);

            const getCurrentPlayerKey = () => {
                const players = this.state.estado.players;
                if (players != undefined) {
                    const playerKeys = Object.keys(players);
                    for (let i = 0; i < playerKeys.length; i++) {
                        const playerKey = playerKeys[i];
                        const player = players[playerKey];
                        if (player.db?.socketId == socket.id) {
                            return `players.${playerKey}`;
                        }
                    }
                }
                return null;
            };

            const affectModel = (keyWrited, val) => {
                const valWrited = {
                    key: keyWrited,
                    val: val,
                };
                this.state.writeKey(keyWrited, val)
                io.emit('stateChanged', JSON.stringify(valWrited));
            };

            const disconnectHandler = () => {
                clients.pop(socket.id);
                const clientDisconnectedMsg = 'User disconnected ' + (socket.id) + ', total: ' + clients.length;

                socket.removeListener(createScoreEvent, createScoreEventHandler);
                socket.removeListener(updateScoreEvent, updateScoreEventHandler);
                socket.removeListener(selectScenarioEvent, selectScenarioEventHandler);
                socket.removeListener(buscarParticipantesEvent, buscarParticipantesEventHandler);
                socket.removeListener(chatEvent, chatEventHandler);
                socket.removeListener('disconnect', disconnectHandler);

                io.emit(chatEvent, clientDisconnectedMsg);

                console.log(clientDisconnectedMsg);
            };

            const chatEventHandler = (msg) => {
                const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
                io.emit(chatEvent, combinedMsg);
                //console.log('multicast: ' + combinedMsg);
            };
            const buscarParticipantesEventHandler = async (inicial) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    const response = await databaseClient.getAllParticipantsByLastNameLetter(inicial);
                    io.to(socket.id).emit('buscarParticipantesResponse', JSON.stringify(response));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const createScoreEventHandler = async (payload) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    // Debe existir primero el escenario seleccionado
                    if (!(this.state.estado?.scene?.id)) {
                        throw "Debe seleccionar primero el escenario";
                    }

                    // Se verifica si ya existe uno anterior...
                    const currentKey = getCurrentPlayerKey();
                    if (currentKey != null) {
                        affectModel(currentKey, undefined);
                    }

                    const insertedId = await databaseClient.createScore(payload.personId, this.state.estado.scene.id);
                    const created = await databaseClient.readScore(insertedId);
                    const participant = await databaseClient.readParticipant(payload.personId);

                    // Escribir en el estado
                    // el modelo
                    participant.scoreId = insertedId;
                    participant.socketId = socket.id;

                    //console.log(JSON.stringify(participant, null, 4));
                    const keyWrited = `players.player_${insertedId}`;
                    affectModel(keyWrited, { db: participant });
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const updateScoreEventHandler = async (payload) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    await databaseClient.updateScore(payload.id, payload.column, payload.value);
                    const changed = await databaseClient.readScore(payload.id);
                    io.to(socket.id).emit('personalChat', JSON.stringify(changed));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const selectScenarioEventHandler = async (payload) => {
                try {
                    const modelo = this.state.loadState(payload.name);
                    // Se envia la raíz del estado para ser reemplazado.
                    io.emit('stateChanged', JSON.stringify({
                        key: "",
                        val: modelo
                    }));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            socket.on(createScoreEvent, createScoreEventHandler);
            socket.on(updateScoreEvent, updateScoreEventHandler);
            socket.on(selectScenarioEvent, selectScenarioEventHandler);
            socket.on(buscarParticipantesEvent, buscarParticipantesEventHandler);
            socket.on(chatEvent, chatEventHandler);
            socket.on('disconnect', disconnectHandler);

            io.to(socket.id).emit('stateChanged', JSON.stringify({
                key: "",
                val: this.state.estado
            }));
        };
    }
}