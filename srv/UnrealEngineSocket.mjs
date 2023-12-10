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
        return (socket) => {

            const clients = UnrealEngineSocket.clients;
            // convenience function to log server messages on the client
            // track connected clients via log
            clients.push(socket.id);
            const clientConnectedMsg = 'User connected ' + (socket.id) + ', total: ' + clients.length;
            io.emit(chatEvent, clientConnectedMsg);
            console.log(clientConnectedMsg);

            io.on("connection", async (socket) => {
                //console.log(`Creating room for ${socket.id}`);
                socket.join(socket.id);
                // Se le actualiza todo el modelo
                io.emit('stateChanged', JSON.stringify({
                    key: "",
                    val: this.state.estado
                }));
            });

            const affectModel = (keyWrited, val) => {
                const valWrited = {
                    key: keyWrited,
                    val: val,
                };
                this.state.writeKey(keyWrited, val)
                io.emit('stateChanged', JSON.stringify(valWrited));
            };

            // track disconnected clients via log
            socket.on('disconnect', () => {

                const keyWrited = `players.socket_${socket.id}`;
                affectModel(keyWrited, undefined);

                clients.pop(socket.id);
                const clientDisconnectedMsg = 'User disconnected ' + (socket.id) + ', total: ' + clients.length;
                io.emit(chatEvent, clientDisconnectedMsg);
                //console.log(clientDisconnectedMsg);
            })

            // multicast received message from client
            socket.on(chatEvent, msg => {
                const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
                io.emit(chatEvent, combinedMsg);
                //console.log('multicast: ' + combinedMsg);
            });

            socket.on(buscarParticipantesEvent, async (inicial) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    const response = await databaseClient.getAllParticipantsByLastNameLetter(inicial);
                    io.to(socket.id).emit('buscarParticipantesResponse', JSON.stringify(response));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            });

            socket.on(createScoreEvent, async (payload) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    // Debe existir primero el escenario seleccionado
                    if (!(this.state.estado?.scene?.id)) {
                        throw "Debe seleccionar primero el escenario";
                    }
                    const insertedId = await databaseClient.createScore(payload.personId, this.state.estado.scene.id);
                    const created = await databaseClient.readScore(insertedId);
                    const participant = await databaseClient.readParticipant(payload.personId);

                    // Escribir en el estado
                    // el modelo
                    participant.scoreId = insertedId;
                    participant.socketId = socket.id;

                    //console.log(JSON.stringify(participant, null, 4));
                    const keyWrited = `players.socket_${socket.id}`;
                    affectModel(keyWrited, participant);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            });

            socket.on(updateScoreEvent, async (payload) => {
                try {
                    const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                    await databaseClient.updateScore(payload.id, payload.column, payload.value);
                    const changed = await databaseClient.readScore(payload.id);
                    io.to(socket.id).emit('personalChat', JSON.stringify(changed));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            });

            socket.on(selectScenarioEvent, async (payload) => {
                try {
                    const modelo = this.state.loadState(payload.name);
                    // Se envia la raíz del estado para ser reemplazado
                    io.emit('stateChanged', JSON.stringify({
                        key: "",
                        val: modelo
                    }));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            });
        };
    }
}