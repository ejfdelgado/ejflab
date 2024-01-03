import * as os from "os";
import md5 from "md5";
import sortify from "../srcJs/sortify.js";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";
import { UnrealEngineState } from "./UnrealEngineState.mjs";
import { serializeError } from 'serialize-error';
import { MyTemplate } from "../srcJs/MyTemplate.js";
import { MyShell } from "./MyShell.mjs";
import { MyUtilities } from "../srcJs/MyUtilities.js";
import mm from 'music-metadata';
import { CsvFormatterFilters } from "../srcJs/CsvFormatterFilters.js";
import { CollisionsEngine } from "../srcJs/CollisionsEngine.js";

const chatEvent = "chatMessage";
const buscarParticipantesEvent = "buscarParticipantes";
const createScoreEvent = "createScore";
const updateScoreEvent = "updateScore";
const stateWriteEvent = "stateWrite";
const stateReadEvent = "stateRead";
const selectScenarioEvent = "selectScenario";
const startGameEvent = "startGame";
const endGameEvent = "endGame";
const updateCodeEvent = "updateCode";
const synchronizeFileEvent = "synchronizeFile";
const voiceEvent = "voice";
const touchEvent = "touch";
const untouchEvent = "untouch";
const popupchoiceEvent = "popupchoice";

export class UnrealEngineSocket {
    static GAME_INTERVAL = 2000;
    static clients = [];	//track connected clients
    static databaseClient = null;
    static state = new UnrealEngineState();
    static conditionalEngine = new MyTemplate();
    static HOMOLOGACION_VOZ = {};
    static ONE_TIME_ARROWS = {};
    static GLOBAL_ONE_TIME_ARROWS = {};
    static collisionEngine = new CollisionsEngine();

    static {
        UnrealEngineSocket.conditionalEngine.registerFunction("rand", CsvFormatterFilters.rand);
    }

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

            const replaceUserId = (text) => {
                return text.replace(/\$\s*\{\s*userid\s*\}/ig, socket.id);
            };

            const replaceUserPath = (text) => {
                const path = getCurrentPlayerKey();
                let nextValue = text;
                let founds = false;
                nextValue = nextValue.replace(/\$\s*\{\s*userpath\s*\}/ig, () => {
                    founds = true;
                    if (path === null) {
                        return "";
                    }
                    return path;
                });
                if (founds && path === null) {
                    throw `Debe seleccionar primero un participante`;
                }
                //console.log(`nextValue = ${nextValue}`);
                return nextValue;
            };

            const replaceUserVars = (text) => {
                return replaceUserId(replaceUserPath(text.trim()));
            };

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
                socket.removeListener(updateCodeEvent, updateCodeEventHandler);
                socket.removeListener(synchronizeFileEvent, synchronizeFileEventHandler);
                socket.removeListener(voiceEvent, voiceEventHandler);
                socket.removeListener(touchEvent, touchEventHandler);
                socket.removeListener(untouchEvent, untouchEventHandler);
                socket.removeListener(popupchoiceEvent, popupchoiceEventHandler);

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
                    const modelo = await this.state.loadState(payload.name);
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
                UnrealEngineSocket.collisionEngine = new CollisionsEngine();
                const currentState = this.state.readKey("st.current");
                let interval = this.state.readKey("scene.interval");
                if (!(typeof interval == "number")) {
                    interval = UnrealEngineSocket.GAME_INTERVAL;
                }
                if (currentState != null) {
                    throw `El entrenamiento ya está iniciado y está corriendo`;
                }
                const nodeIds = this.state.getIdNodeWithText("inicio");
                const history = nodeIds.map((node) => {
                    return { id: node, t: 0 }
                });
                const nuevosSt = {
                    current: nodeIds,
                    startedAt: new Date().getTime(),
                    duration: 0,
                    voice: undefined,
                    lastvoice: undefined,
                    touch: undefined,
                    history: history,
                };
                // Buscar inicio
                this.state.writeKey("timer", {});
                this.state.writeKey("silences", {});
                UnrealEngineSocket.ONE_TIME_ARROWS = {};
                UnrealEngineSocket.GLOBAL_ONE_TIME_ARROWS = {};
                // Inicialización
                affectModel("st", nuevosSt);
                setTimeout(() => {
                    moveState();
                }, interval);
            }

            const filterSourceArrowsFromSource = (arrows, srcId) => {
                return arrows.filter((arrow) => arrow.src == srcId);
            }

            const findNodeById = (nodes, id) => {
                const temp = nodes.filter((node) => node.id == id);
                if (temp.length > 0) {
                    return temp[0];
                } else {
                    return null;
                }
            };

            const increaseAmount = (key, amount = 1) => {
                try {
                    const increaseKey = replaceUserVars(key);
                    // console.log(`increaseKey = ${increaseKey}`);
                    let currentValue = this.state.readKey(increaseKey);
                    if (!(typeof currentValue == "number")) {
                        currentValue = 0;
                    }
                    currentValue += amount;
                    //this.state.writeKey(increaseKey, currentValue);//Not live
                    affectModel(increaseKey, currentValue);//Live
                } catch (err) {
                    io.emit(chatEvent, err);
                }
            };

            const moveState = async () => {
                const history = this.state.readKey("st.history");
                const currentState = this.state.readKey("st.current");
                const startedAt = this.state.readKey("st.startedAt");
                let interval = this.state.readKey("scene.interval");
                let collisionMemory = this.state.readKey("st.touch");
                const collisionEngine = UnrealEngineSocket.collisionEngine;
                collisionEngine.startSession();
                if (!collisionMemory) {
                    collisionMemory = {};
                }

                if (!(typeof interval == "number")) {
                    interval = UnrealEngineSocket.GAME_INTERVAL;
                }
                if (currentState == null) {
                    // El juego ya terminó
                    collisionEngine.endSession();
                    return;
                }
                const graph = this.state.readKey("zflowchart");
                const arrows = graph.arrows;
                const shapes = graph.shapes;
                //console.log(`Evaluating next steps from ${JSON.stringify(currentState)}`);

                // Validar las flechas y tomar todas las que sean verdaderas
                const outputPositiveGlobal = {};
                const outputArrowsReset = [];
                const currentTime = this.state.readKey("st.duration");
                for (let i = 0; i < currentState.length; i++) {
                    const srcId = currentState[i];
                    const outputArrows = filterSourceArrowsFromSource(arrows, srcId);
                    if (outputArrows.length > 0) {
                        const silenceArrowKeys = [];
                        const timerArrowKeys = [];
                        let atLeastOneOutput = false;
                        let arrowsReset = false;
                        // Este nodo se debe validar si cumple al menos una salida
                        for (let j = 0; j < outputArrows.length; j++) {
                            const outputArrow = outputArrows[j];
                            const arrowId = outputArrow.id;
                            let isOneTimeArrow = false;
                            let isGlobalOneTimeArrow = false;
                            try {
                                let evaluated = true;
                                if (typeof outputArrow.txt == "string" && outputArrow.txt.trim() != "") {
                                    // Se valida si es una flecha de una sola vez con el asterisco
                                    let textoIf = outputArrow.txt.replace(/\n/ig, ' ');
                                    const tokensAsterisk = /^\s*([*]{1,2})/.exec(textoIf);
                                    if (tokensAsterisk != null) {
                                        //console.log(JSON.stringify(tokensAsterisk));
                                        textoIf = textoIf.replace(/^\s*[*]{1,2}/, "");
                                        isOneTimeArrow = true;
                                        if (tokensAsterisk[1] == "**") {
                                            isGlobalOneTimeArrow = true;
                                            // Globalmente se debe usar solo una vez esta flecha
                                            if (typeof UnrealEngineSocket.GLOBAL_ONE_TIME_ARROWS[arrowId] == "number") {
                                                textoIf = "false";
                                            }
                                        } else if (typeof UnrealEngineSocket.ONE_TIME_ARROWS[arrowId] == "number") {
                                            textoIf = "false";
                                        }
                                    }
                                    // Se valida si la flecha tiene arrowsreset()
                                    textoIf = textoIf.replace(/arrowsreset\s*\(\s*\)/ig, () => {
                                        arrowsReset = true;
                                        return "true";
                                    });

                                    // Se hace manejo de touched() istouched() isnottouched() untouched()
                                    textoIf = textoIf.replace(/(touched|istouched|isnottouched|untouched)\(([^)]+)\)/ig, (wholeMatch, command, content) => {
                                        // console.log(`command = ${command} content = ${content}`);
                                        const partes = content.split(":");
                                        const key = partes[0].trim();
                                        const objectKey = partes[1].trim();
                                        let response = false;
                                        if (command == "touched") {
                                            response = collisionEngine.hadCollision(key, objectKey);
                                        } else if (command == "istouched") {
                                            response = collisionEngine.hasCollision(collisionMemory, key, objectKey);
                                        } else if (command == "isnottouched") {
                                            response = collisionEngine.hasNotCollision(collisionMemory, key, objectKey);
                                        } else if (command == "untouched") {
                                            response = collisionEngine.hadUncollision(key, objectKey);
                                        }
                                        if (response === false) {
                                            return "false";
                                        } else {
                                            return "true";
                                        }
                                    });
                                    // Se hace manejo de call(sound,...,...)
                                    textoIf = await MyUtilities.replaceAsync(textoIf, /call\s*\(([^)]+)\)/ig, async (command) => {
                                        const callArgs = MyTemplate.readCall(command, this.state.estado);
                                        let replaceValue = "true";
                                        if (callArgs.action != null) {
                                            let callSkip = false;
                                            // Si es un call de sound:
                                            if (callArgs.action == "sound") {
                                                // sin loop, se reemplaza por el timer
                                                if (callArgs.arguments.length >= 2 && callArgs.arguments[1] !== "loop") {
                                                    let filename = callArgs.arguments[0];
                                                    if (/\.(wav|mp3)$/i.test(filename)) {
                                                        // Si es wav, se lee el archivo y se pregunta por:
                                                        // frame rate & number of frames
                                                        const filePath = `./src/assets/police/sounds/${filename}`;
                                                        let metadata = null;
                                                        try {
                                                            metadata = await mm.parseFile(filePath);
                                                        } catch (err) {
                                                            console.log(err);
                                                        }
                                                        if (metadata != null) {
                                                            const durationMillis = metadata.format.duration * 1000;
                                                            const name = `,${filename}`;
                                                            const arrowIdTimer = `${arrowId}_${md5(name)}`;
                                                            const timerKey = `timer.${arrowIdTimer}`;
                                                            const oldTimer = this.state.readKey(timerKey);
                                                            if (typeof oldTimer == "number") {
                                                                // El timer ya fue asignado y no se debe hacer skip a la acción
                                                                callSkip = true;
                                                            }
                                                            replaceValue = `sleep(${Math.ceil(durationMillis)}${name})`;
                                                        }
                                                    }
                                                }
                                            }

                                            if (!callSkip) {
                                                if (callArgs.length == 0) {
                                                    io.emit(callArgs.action, '""');
                                                } else if (callArgs.arguments.length == 1) {
                                                    io.emit(callArgs.action, JSON.stringify(callArgs.arguments[0]));
                                                } else {
                                                    io.emit(callArgs.action, JSON.stringify(callArgs.arguments));
                                                }
                                            }
                                        }
                                        return replaceValue;
                                    });
                                    // Se hace manejo de sleep(###)
                                    if (/sleep\(([^),]*)([^)]*)\)/ig.exec(textoIf) != null) {
                                        textoIf = textoIf.replace(/sleep\(([^),]*)([^)]*)\)/ig, (match, tiempo, name) => {
                                            let arrowIdTimer = arrowId;
                                            if (typeof name == "string" && name.length > 0) {
                                                arrowIdTimer += "_" + md5(name);
                                            }
                                            const timerKey = `timer.${arrowIdTimer}`;
                                            timerArrowKeys.push(arrowIdTimer);
                                            const oldTimer = this.state.readKey(timerKey);

                                            if (!(typeof oldTimer == "number")) {
                                                this.state.writeKey(timerKey, currentTime);
                                            }
                                            const renderedTime = this.conditionalEngine.computeIf(tiempo, this.state.estado);
                                            //console.log(`renderedTime = ${renderedTime}`);
                                            return "${st.duration} - ${timer." + arrowIdTimer + "} > " + renderedTime;
                                        });
                                    }
                                    // Se hace manejo de silence()
                                    if (/silence\(\s*\)/ig.exec(textoIf) != null) {
                                        textoIf = textoIf.replace(/silence\(\s*\)/ig, "${st.duration} - ${st.lastvoice} > ${scene.voz_segundos_buffer}*1000");
                                        const silencesKey = `silences.${arrowId}`;
                                        silenceArrowKeys.push(arrowId);
                                        const oldSilenceValue = this.state.readKey(silencesKey);
                                        if (!(typeof oldSilenceValue == "number")) {
                                            this.state.writeKey(silencesKey, currentTime);
                                            this.state.writeKey("st.lastvoice", currentTime);
                                        }
                                    }
                                    // Se hace manejo de voice(...)
                                    textoIf = textoIf.replace(/voice\(([^)]+)\)/ig, (wholeMatch, searchedText) => {
                                        // Se debe validar si este texto existe en el record de voz
                                        if (voiceDetection(searchedText)) {
                                            return "true";
                                        } else {
                                            return "false";
                                        }
                                    });
                                    evaluated = UnrealEngineSocket.conditionalEngine.computeIf(textoIf, this.state.estado);
                                }
                                if (evaluated) {
                                    atLeastOneOutput = true;
                                    history.push({ id: arrowId, t: currentTime, type: "arrow", txt: outputArrow.txt });
                                    if (!(srcId in outputPositiveGlobal)) {
                                        outputPositiveGlobal[srcId] = [];
                                    }
                                    outputPositiveGlobal[srcId].push(outputArrow.tar);
                                    if (arrowsReset) {
                                        outputArrowsReset.push(outputArrow.tar);
                                    }
                                    if (isOneTimeArrow) {
                                        UnrealEngineSocket.ONE_TIME_ARROWS[arrowId] = currentTime;
                                        if (isGlobalOneTimeArrow) {
                                            UnrealEngineSocket.GLOBAL_ONE_TIME_ARROWS[arrowId] = currentTime;
                                        }
                                    }
                                }
                            } catch (err) {
                                console.log(outputArrow.txt);
                                console.log(err);
                            }
                        }
                        if (atLeastOneOutput) {
                            // Se limpian las marcas temporales de salida
                            for (let k = 0; k < silenceArrowKeys.length; k++) {
                                const arrowId = silenceArrowKeys[k];
                                const silencesKey = `silences.${arrowId}`;
                                this.state.writeKey(silencesKey, null);
                            }
                            for (let k = 0; k < timerArrowKeys.length; k++) {
                                const arrowId = timerArrowKeys[k];
                                const silencesKey = `timer.${arrowId}`;
                                this.state.writeKey(silencesKey, null);
                            }

                        }
                    }
                }

                // Ejecución de los nodos donde llega
                // Se hace el cambio
                let forceFinish = false;
                const nodosViejos = Object.keys(outputPositiveGlobal);
                for (let i = 0; i < nodosViejos.length; i++) {
                    const srcId = nodosViejos[i];
                    const nodosLlegada = outputPositiveGlobal[srcId];
                    // Ejecutar las acciones que existan en los nodos de llegada

                    const indiceViejo = currentState.indexOf(srcId);
                    if (indiceViejo >= 0) {
                        //console.log(`Sacando nodo ${srcId} del estado actual en índice ${indiceViejo}`);
                        currentState.splice(indiceViejo, 1);
                    }
                    for (let j = 0; j < nodosLlegada.length; j++) {
                        const nodoLlegada = nodosLlegada[j];
                        const theNode = findNodeById(shapes, nodoLlegada);
                        if (["box", "ellipse", "rhombus"].indexOf(theNode.type) >= 0) {
                            const textNode = theNode.txt;
                            if (typeof textNode == "string") {
                                if (textNode == "fin") {
                                    forceFinish = true;
                                    continue;
                                }
                                const commands = textNode.split(/\n/ig);
                                for (let m = 0; m < commands.length; m++) {
                                    const command = commands[m];
                                    // Si es un comentario continúa
                                    if (/^\s*[/]{2,}/.exec(command) != null) {
                                        console.log(`Skiping ${command}`);
                                        continue;
                                    }
                                    // Se valida si es un comando call{sound, param, param}
                                    const callArgs = MyTemplate.readCall(command, this.state.estado);
                                    if (callArgs.action != null) {
                                        // Se ejecuta la acción
                                        //console.log(`call ${callArgs.action}`);
                                        if (callArgs.length == 0) {
                                            io.emit(callArgs.action, '""');
                                        } else if (callArgs.arguments.length == 1) {
                                            io.emit(callArgs.action, JSON.stringify(callArgs.arguments[0]));
                                        } else {
                                            io.emit(callArgs.action, JSON.stringify(callArgs.arguments));
                                        }
                                    } else {
                                        // se valida si es increase(...)
                                        const tokensIncrease = /^\s*increase\s*\(([^)]+)\)$/.exec(command);
                                        if (tokensIncrease != null) {
                                            increaseAmount(tokensIncrease[1], 1)
                                            continue;
                                        }
                                        const tokensPopUp = /^\s*popup\s*\(([^)]+)\)$/.exec(command);
                                        if (tokensPopUp != null) {
                                            const popupKey = tokensPopUp[1].trim();
                                            const currentValue = this.state.readKey(popupKey);
                                            if (!currentValue) {
                                                console.log(`Error leyendo popup de ${popupKey}`);
                                                continue;
                                            }
                                            // Asigno la ruta como cllbackid
                                            currentValue.callback = popupKey;
                                            io.emit('popupopen', JSON.stringify(currentValue));
                                            continue;
                                        }
                                        // Default way to resolve node actions
                                        const tokensCommand = /^\s*[$]{\s*([^}]+)\s*[}]\s*=(.*)$/ig.exec(command);
                                        if (tokensCommand != null) {
                                            const destinationVar = tokensCommand[1];
                                            const preProcesedValue = tokensCommand[2];
                                            const value = this.conditionalEngine.computeIf(preProcesedValue, this.state.estado);
                                            //console.log(`destinationVar = ${destinationVar} preProcesedValue = ${preProcesedValue} value = ${value}`);
                                            affectModel(destinationVar, value);
                                        }
                                    }
                                }
                            }
                        }
                        currentState.push(nodoLlegada);
                        //console.log(`vamos en ${JSON.stringify(currentState)}`);
                        history.push({ id: theNode.id, t: currentTime, type: "node", txt: theNode.txt });
                        // Se valida si llegó a este nodo por medio de una flecha con arrowsreset()
                        if (outputArrowsReset.indexOf(nodoLlegada) >= 0) {
                            // Se deben borrar los ids de las flechas de salida de este nodo
                            const outputArrowsNext = filterSourceArrowsFromSource(arrows, nodoLlegada);
                            for (let k = 0; k < outputArrowsNext.length; k++) {
                                const outputArrow = outputArrowsNext[k];
                                const arrowId = outputArrow.id;
                                delete UnrealEngineSocket.ONE_TIME_ARROWS[arrowId];
                            }
                        }
                    }
                }
                const nuevosSt = {
                    duration: new Date().getTime() - startedAt,
                };
                if (nodosViejos.length > 0) {
                    nuevosSt.history = history;
                    nuevosSt.current = currentState;
                }
                if (forceFinish) {
                    nuevosSt.current = null;
                }
                //console.log(`Escribiendo ${JSON.stringify(nuevosSt)}`);
                affectModel("st", nuevosSt);
                collisionEngine.endSession();

                setTimeout(() => {
                    moveState();
                }, interval);
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
                    // Se cargan las homologaciones de voz
                    UnrealEngineSocket.HOMOLOGACION_VOZ = JSON.parse(await this.state.proxyReadFile("./data/ue/scenes/homologacion_voz.json"));
                    //console.log(JSON.stringify(UnrealEngineSocket.HOMOLOGACION_VOZ));
                    console.log("Starting game...");

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

            const updateCodeEventHandler = async (payload) => {
                try {
                    const dato = await MyShell.runLocal("git pull", null);
                    io.to(socket.id).emit('personalChat', dato);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const synchronizeFileEventHandler = async (payload) => {
                try {
                    this.state.saveInMemoryTextFile(`./data/ue/scenes/${payload.fileName}`, payload.base64);
                    io.to(socket.id).emit('personalChat', "Ok");
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const voiceEventHandler = async (payload) => {
                try {
                    let voiceHistory = this.state.readKey("st.voice");

                    if (!(voiceHistory instanceof Array)) {
                        voiceHistory = [];
                    }
                    // reemplazar todo lo que no es texto con vacio
                    const sanitized = payload.toLowerCase().replace(/[^a-zA-Z\s]/ig, '').replace(/\s{2,}/, " ");
                    // partir en tokens
                    const tokens = sanitized.split(/\s/);
                    // crear objeto con fecha
                    const ahora = this.state.readKey("st.duration");
                    for (let i = 0; i < tokens.length; i++) {
                        const token = tokens[i];
                        if (token.trim().length > 0) {
                            voiceHistory.push({
                                t: ahora,
                                d: token,
                            });
                        }
                    }
                    // Se filtran los que tienen X tiempo de antiguedad
                    let { changes, voiceHistoryFiltered } = filterVoiceGap(voiceHistory);
                    if (changes) {
                        voiceHistory = voiceHistoryFiltered;
                    }
                    this.state.writeKey("st.lastvoice", ahora);

                    //this.state.writeKey("st.voice", voiceHistory);//Not live
                    affectModel("st.voice", voiceHistory);//Live
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            const touchEventHandler = async (payload) => {
                try {
                    // console.log(`Touch ${payload}`);
                    let memory = this.state.readKey("st.touch");
                    if (!memory) {
                        memory = {};
                    }
                    const partes = payload.split(":");
                    const key = partes[0];
                    const objectKey = partes[1];
                    const changed = UnrealEngineSocket.collisionEngine.collide(memory, key, objectKey);
                    if (changed) {
                        //this.state.writeKey("st.touch", memory);//Not live
                        affectModel("st.touch", memory);//Live
                    }
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            const untouchEventHandler = async (payload) => {
                try {
                    // console.log(`Untouch ${payload}`);
                    let memory = this.state.readKey("st.touch");
                    if (!memory) {
                        memory = {};
                    }
                    const partes = payload.split(":");
                    const key = partes[0];
                    const objectKey = partes[1];
                    const changed = UnrealEngineSocket.collisionEngine.uncollide(memory, key, objectKey);
                    if (changed) {
                        //this.state.writeKey("st.touch", memory);//Not live
                        affectModel("st.touch", memory);//Live
                    }
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            const popupchoiceEventHandler = async (payload) => {
                try {
                    //console.log(`PopUp Choice ${JSON.stringify(payload)}`);
                    const popupRef = this.state.readKey(payload.callback);
                    const mychoice = payload.choice;
                    if (popupRef.type == "info") {
                        // Ignore
                    } else if (popupRef.type == "knowledge") {
                        // Check correct answer
                        let points = 0;
                        popupRef.choices.forEach((choice) => {
                            if (choice.val == mychoice) {
                                if (typeof choice.points == "number") {
                                    points += choice.points;
                                }
                            }
                        });
                        if (points > 0) {
                            const destination = popupRef.destination;
                            if (destination instanceof Array) {
                                for (let i = 0; i < destination.length; i++) {
                                    const keyPath = destination[i];
                                    increaseAmount(keyPath, points);
                                }
                            }
                        }
                    } else if (popupRef.type == "assignment") {
                        const destination = popupRef.destination;
                        if (destination instanceof Array) {
                            for (let i = 0; i < destination.length; i++) {
                                let keyPath = destination[i];
                                keyPath = replaceUserVars(keyPath);
                                //console.log(`keyPath = ${keyPath} mychoice = ${mychoice}`);
                                //this.state.writeKey(keyPath, mychoice);//Not live
                                affectModel(keyPath, mychoice);//Live
                            }
                        }
                    }
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            const voiceDetection = (llave) => {
                const redaccion = readVoice();
                //console.log(`detection ${llave} en ${redaccion}`);
                if (redaccion == null) {
                    return false;
                }
                const homologacion = UnrealEngineSocket.HOMOLOGACION_VOZ;
                if (redaccion.indexOf(llave) >= 0) {
                    return true;
                }
                const alternativas = homologacion[llave];
                if (alternativas instanceof Array) {
                    for (let i = 0; i < alternativas.length; i++) {
                        const alternativa = alternativas[i];
                        if (redaccion.indexOf(alternativa) >= 0) {
                            return true;
                        }
                    }
                }
                return false;
            }

            const readVoice = (show = false) => {
                let voiceHistory = this.state.readKey("st.voice");
                // Si no es arreglo
                if (!(voiceHistory instanceof Array)) {
                    return null;
                }
                // Si está vacio
                if (voiceHistory.length == 0) {
                    return null;
                }

                // De lo contrario lo filtra
                let { changes, voiceHistoryFiltered } = filterVoiceGap(voiceHistory);
                if (changes) {
                    voiceHistory = voiceHistoryFiltered;
                }
                // Si cambio lo reescribe sin notificar
                // Arma el texto con espacios .join(' ');
                const texto = voiceHistory.reduce((previousValue, currentValue, currentIndex, array) => {
                    return previousValue + " " + currentValue.d;
                }, "");
                if (show) {
                    affectModel("st.voicegap", texto);
                }
                return texto;
            }

            const filterVoiceGap = (voiceHistory) => {
                const ahora = this.state.readKey("st.duration");
                let VOZ_MILLIS_BUFFER = this.state.readKey("scene.voz_segundos_buffer");
                if (!(typeof VOZ_MILLIS_BUFFER == "number")) {
                    VOZ_MILLIS_BUFFER = 5;
                }
                VOZ_MILLIS_BUFFER *= 1000;
                let changes = false;
                voiceHistory = voiceHistory.filter((elem) => {
                    if (ahora - elem.t > VOZ_MILLIS_BUFFER) {
                        changes = true;
                        return false;
                    }
                    return true;
                });

                return { changes, voiceHistoryFiltered: voiceHistory };
            }

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
            socket.on(updateCodeEvent, updateCodeEventHandler);
            socket.on(synchronizeFileEvent, synchronizeFileEventHandler);
            socket.on(voiceEvent, voiceEventHandler);
            socket.on(touchEvent, touchEventHandler);
            socket.on(untouchEvent, untouchEventHandler);
            socket.on(popupchoiceEvent, popupchoiceEventHandler);

            io.to(socket.id).emit('stateChanged', JSON.stringify({
                key: "",
                val: this.state.estado
            }));
        };
    }
}