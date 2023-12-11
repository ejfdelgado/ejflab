import * as os from "os";
import sortify from "../srcJs/sortify.js";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";
import { UnrealEngineState } from "./UnrealEngineState.mjs";
import { serializeError } from 'serialize-error';
import { MyTemplate } from "../srcJs/MyTemplate.js";

const chatEvent = "chatMessage";
const buscarParticipantesEvent = "buscarParticipantes";
const createScoreEvent = "createScore";
const updateScoreEvent = "updateScore";
const stateWriteEvent = "stateWrite";
const stateReadEvent = "stateRead";
const selectScenarioEvent = "selectScenario";
const startGameEvent = "startGame";
const endGameEvent = "endGame";

export class UnrealEngineSocket {
    static GAME_INTERVAL = 2000;
    static clients = [];	//track connected clients
    static databaseClient = null;
    static state = new UnrealEngineState();
    static conditionalEngine = new MyTemplate();

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
                socket.removeListener(stateWriteEvent, stateWriteEventHandler);
                socket.removeListener(stateReadEvent, stateReadEventHandler);
                socket.removeListener('disconnect', disconnectHandler);
                socket.removeListener(startGameEvent, startGameEventHandler);
                socket.removeListener(endGameEvent, endGameEventHandler);

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

                    const insertedId = await databaseClient.createScore(payload.personId, this.state.estado.scene?.id);
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

            const computeMineKey = (payload) => {
                let key = payload.key.trim();
                if (payload.mine === true) {
                    const currentKey = getCurrentPlayerKey();
                    if (currentKey == null) {
                        throw "Primero debe Crear Score";
                    }
                    if (key != "") {
                        key = currentKey + "." + key;
                    } else {
                        key = currentKey;
                    }
                }
                return key;
            };

            const stateWriteEventHandler = async (payload) => {
                try {
                    // Se publica a todos
                    const key = computeMineKey(payload);
                    affectModel(key, payload.val);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const stateReadEventHandler = async (payload) => {
                try {
                    // Se lee
                    const key = computeMineKey(payload);
                    const valor = this.state.readKey(key);
                    // Se publica solo a quien lo solicitó
                    io.to(socket.id).emit('stateChanged', JSON.stringify({
                        key: key,
                        val: valor
                    }));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const goToStartingPoint = () => {
                const currentState = this.state.readKey("st.current");
                if (currentState != null) {
                    throw `El entrenamiento ya está iniciado y está corriendo`;
                }
                const nodeIds = this.state.getIdNodeWithText("inicio");
                affectModel("st.current", nodeIds);
                setTimeout(() => {
                    moveState();
                }, UnrealEngineSocket.GAME_INTERVAL);
            }

            const filterSourceArrowsFromSource = (arrows, srcId) => {
                return arrows.filter((arrow) => arrow.src == srcId);
            }

            const moveState = async () => {
                const currentState = this.state.readKey("st.current");
                if (currentState == null) {
                    // El juego ya terminó
                    return;
                }
                const graph = this.state.readKey("zflowchart");
                const arrows = graph.arrows;
                //console.log(`Evaluating next steps from ${currentState}`);

                // Validar las flechas y tomar todas las que sean verdaderas
                const outputPositiveGlobal = {};
                for (let i = 0; i < currentState.length; i++) {
                    const srcId = currentState[i];
                    const outputArrows = filterSourceArrowsFromSource(arrows, srcId);
                    if (outputArrows.length > 0) {
                        // Este nodo se debe validar si cumple al menos una salida
                        for (let j = 0; j < outputArrows.length; j++) {
                            const outputArrow = outputArrows[j];
                            try {
                                let evaluated = true;
                                if (typeof outputArrow.txt == "string" && outputArrow.txt.trim() != "") {
                                    evaluated = UnrealEngineSocket.conditionalEngine.computeIf(outputArrow.txt, this.state.estado);
                                }
                                if (evaluated) {
                                    if (!(srcId in outputPositiveGlobal)) {
                                        outputPositiveGlobal[srcId] = [];
                                    }
                                    outputPositiveGlobal[srcId].push(outputArrow.tar);
                                }
                            } catch (err) {
                                console.log(outputArrow.txt);
                                console.log(err);
                            }
                        }
                    }
                }
                // Se hace el cambio
                const nodosViejos = Object.keys(outputPositiveGlobal);
                for (let i = 0; i < nodosViejos.length; i++) {
                    const srcId = nodosViejos[i];
                    const nodosLlegada = outputPositiveGlobal[srcId];
                    // Ejecutar las acciones que existan en los nodos de llegada
                    const indiceViejo = currentState.indexOf(srcId);
                    if (indiceViejo >= 0) {
                        currentState.splice(indiceViejo);
                    }
                    for (let j = 0; j < nodosLlegada.length; j++) {
                        const nodoLlegada = nodosLlegada[j];
                        currentState.push(nodoLlegada);
                    }
                }
                if (nodosViejos.length > 0) {
                    affectModel("st.current", currentState);
                }

                setTimeout(() => {
                    moveState();
                }, UnrealEngineSocket.GAME_INTERVAL);
            };

            const startGameEventHandler = async (payload) => {
                try {
                    // Se debe validar si ya hay escenario

                    if (!(this.state.estado?.scene?.id)) {
                        throw "Debe seleccionar primero el escenario";
                    }
                    /*
                    if (!(this.state.estado?.players)) {
                        throw "Debe seleccionar los participantes";
                    }
                    if (Object.keys(this.state.estado?.players).length < 2) {
                        throw "Debe seleccionar al menos dos participantes";
                    }
                    */
                    console.log("Starting game...");
                    // Buscar inicio
                    goToStartingPoint();

                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const endGameEventHandler = async (payload) => {
                try {
                    const currentState = this.state.readKey("st.current");
                    if (currentState == null) {
                        throw "El entrenamiento ya está terminado";
                    }
                    affectModel("st.current", null);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            socket.on(createScoreEvent, createScoreEventHandler);
            socket.on(updateScoreEvent, updateScoreEventHandler);
            socket.on(selectScenarioEvent, selectScenarioEventHandler);
            socket.on(buscarParticipantesEvent, buscarParticipantesEventHandler);
            socket.on(chatEvent, chatEventHandler);
            socket.on(stateWriteEvent, stateWriteEventHandler);
            socket.on(stateReadEvent, stateReadEventHandler);
            socket.on('disconnect', disconnectHandler);
            socket.on(startGameEvent, startGameEventHandler);
            socket.on(endGameEvent, endGameEventHandler);

            io.to(socket.id).emit('stateChanged', JSON.stringify({
                key: "",
                val: this.state.estado
            }));
        };
    }
}