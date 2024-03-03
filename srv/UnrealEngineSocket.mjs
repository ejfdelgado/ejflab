
import sortify from "../srcJs/sortify.js";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";
import { UnrealEngineState } from "./UnrealEngineState.mjs";
import { serializeError } from 'serialize-error';
import { MyShell } from "./MyShell.mjs";
import { SimpleObj } from "../srcJs/SimpleObj.js";
import { CommandStartGame } from "./commands/CommandStartGame.mjs";
import { CommandEndGame } from "./commands/CommandEndGame.mjs";
import { CommandStep } from "./commands/CommandStep.mjs";
import { CommandTouch } from "./commands/CommandTouch.mjs";
import { CommandUntouch } from "./commands/CommandUntouch.mjs";
import { CommandSelectChoicePopUp } from "./commands/CommandSelectChoicePopUp.mjs";
import { CommandCreateScore } from "./commands/CommandCreateScore.mjs";
import { CommandVoice } from "./commands/CommandVoice.mjs";
import { CommandSearchUser } from "./commands/CommandSearchUser.mjs";
import { CommandUpdateScore } from "./commands/CommandUpdateScore.mjs";
import { CommandSelectScenario } from "./commands/CommandSelectScenario.mjs";
import { CommandTriangulacion } from "./commands/CommandTriangulacion.mjs";

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
const triangulacionEvent = "triangulacion";

export class UnrealEngineSocket {
    static ROOT_FOLDER = "./src/assets/police/scripts/";
    static clients = [];	//track connected clients
    static databaseClient = null;
    static state = new UnrealEngineState();
    static HOMOLOGACION_VOZ = {};
    static SINONIMOS_VOZ = {};

    static INITIAL_AVATAR_VALUE = {};

    static preprocessSinonimosVoz = (sinonimos) => {
        const result = {};
        // Debo iterar las llaves
        const llaves = Object.keys(sinonimos);
        for (let i = 0; i < llaves.length; i++) {
            const llave = llaves[i];
            const lista = sinonimos[llave];
            for (let j = 0; j < lista.length; j++) {
                const palabraFea = lista[j];
                result[palabraFea] = llave;
            }
        }
        return result;
    };

    //UnrealEngineSocket.reloadVoiceHelpers("homologacion_voz.json", "caso1_sinonimos_voz.json");
    static async reloadVoiceHelpers(homologacionFile, sinonimosFile) {
        console.log(`Loading voice helpers ${homologacionFile} ${sinonimosFile}...`);
        UnrealEngineSocket.HOMOLOGACION_VOZ = JSON.parse(await this.state.proxyReadFile(`${UnrealEngineSocket.ROOT_FOLDER}${homologacionFile}`));
        UnrealEngineSocket.SINONIMOS_VOZ = UnrealEngineSocket.preprocessSinonimosVoz(JSON.parse(await this.state.proxyReadFile(`${UnrealEngineSocket.ROOT_FOLDER}${sinonimosFile}`)));
        console.log("Voice helpers ok!");
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

    static sendCommand(command, content, io) {
        const completo = {
            command,
            content,
        };
        io.emit(completo.command, JSON.stringify(completo.content));
        io.emit('personalChat', JSON.stringify(completo));
    };

    static async moveState(io, socket) {
        await new CommandStep(this, io, socket).execute();
    }

    static computeMineKey(payload, socket) {
        let key = payload.key.trim();
        if (payload.mine === true) {
            const currentKey = this.getCurrentPlayerKey(socket);
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

    static replaceUserId(text, socket) {
        return text.replace(/\$\s*\{\s*userid\s*\}/ig, socket.id);
    };

    static replaceUserPath(text, socket) {
        const path = this.getCurrentPlayerKey(socket);
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

    static getCurrentPlayerKey(socket) {
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

    static replaceUserVars(text, socket) {
        return this.replaceUserId(this.replaceUserPath(text.trim(), socket), socket);
    };

    static increaseAmount(io, socket, keyIncoming, amount = 1) {
        try {
            // Se mira si hay coma
            const partes = keyIncoming.split(",");
            const key = partes[0].trim();
            let sound = "common/point.mp3";
            if (partes.length > 1) {
                sound = partes[1].trim();
            }
            const increaseKey = this.replaceUserVars(key, socket);
            //console.log(`increaseKey = ${increaseKey}`);
            let currentValue = this.state.readKey(increaseKey);
            if (!(typeof currentValue == "number")) {
                currentValue = 0;
            }
            currentValue += amount;
            //console.log(`writing = ${increaseKey} with ${currentValue}`);
            //this.state.writeKey(increaseKey, currentValue);//Not live
            this.affectModel(increaseKey, currentValue, io);//Live
            // Send sound feedback
            if (amount > 0) {
                if (sound.length > 0 && ["no"].indexOf(sound) < 0) {
                    this.sendCommand("sound", [sound, "", "", 0], io);
                }
            } else {
                this.sendCommand("sound", ["common/error.mp3", "", "", 0], io);
            }
        } catch (err) {
            console.log(err);
            io.emit(chatEvent, err);
        }
    };

    static writeUniversal(keyWrited, val, io, publish) {
        if (publish === true) {
            this.affectModel(keyWrited, val, io);
        } else {
            this.state.writeKey(keyWrited, val);
        }
    }

    static affectModel = (keyWrited, val, io) => {
        const valWrited = {
            key: keyWrited,
            val: val,
        };
        this.state.writeKey(keyWrited, val);
        // ease for UE client
        const partes = /^avatar\.([^.]+)\.(.+)$/.exec(keyWrited);
        if (partes != null) {
            valWrited.avatar = partes[1];
            valWrited.prop = partes[2];
        }
        io.emit('stateChanged', JSON.stringify(valWrited));
    };

    static voiceDetection(llave) {
        const redaccion = this.readVoice();
        //console.log(`detection ${llave} en ${redaccion}`);
        if (redaccion == null) {
            return false;
        }
        if (llave === undefined || llave.trim().length == 0) {
            // Si era vacío lo que tenía que buscar y hay algo de redacción, entonces es true
            return true;
        }
        //console.log(`redaccion = ${redaccion} vs ${llave}`);
        const homologacion = UnrealEngineSocket.HOMOLOGACION_VOZ;
        if (redaccion.indexOf(llave) >= 0) {
            return true;
        }
        const alternativas = homologacion[llave];
        if (alternativas instanceof Array) {
            for (let i = 0; i < alternativas.length; i++) {
                const alternativa = alternativas[i];
                const re = new RegExp(`(^|\\s+)(${alternativa})($|\\s+)`, "i");
                if (re.exec(redaccion) != null) {
                    //console.log(`redaccion = ${JSON.stringify(redaccion)} vs ${JSON.stringify(alternativa)}`);
                    return true;
                }
            }
        }
        return false;
    }

    static readVoice(show = false) {
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
        let { changes, voiceHistoryFiltered } = this.filterVoiceGap(voiceHistory);
        // Si está vacio el gap
        if (voiceHistoryFiltered.length == 0) {
            return null;
        }
        if (changes) {
            voiceHistory = voiceHistoryFiltered;
        }
        // Si cambio lo reescribe sin notificar
        // Arma el texto con espacios .join(' ');
        const texto = voiceHistory.reduce((previousValue, currentValue, currentIndex, array) => {
            return previousValue + " " + currentValue.d;
        }, "");
        if (show) {
            this.affectModel("st.voicegap", texto, io);
        }
        return texto;
    }

    static filterVoiceGap(voiceHistory) {
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

    static echoCommand(command, content, io, socket) {
        const logMessage = `ECHO ${command} ${JSON.stringify(content)}`;
        console.log(logMessage);
        io.to(socket.id).emit('personalChat', logMessage);
    };

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

            // Sends initialization for avatar
            this.affectModel(`avatar.${socket.id}`, JSON.parse(JSON.stringify(UnrealEngineSocket.INITIAL_AVATAR_VALUE)), io);

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
                socket.removeListener(triangulacionEvent, triangulacionEventHandler);

                io.emit(chatEvent, clientDisconnectedMsg);

                console.log(clientDisconnectedMsg);
            };

            const chatEventHandler = (msg) => {
                const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
                io.emit(chatEvent, combinedMsg);
                //console.log('multicast: ' + combinedMsg);
            };
            const buscarParticipantesEventHandler = async (payload) => {
                try {
                    await new CommandSearchUser(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const createScoreEventHandler = async (payload) => {
                try {
                    await new CommandCreateScore(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const updateScoreEventHandler = async (payload) => {
                try {
                    await new CommandUpdateScore(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', serializeError(err));
                }
            };

            const selectScenarioEventHandler = async (payload) => {
                try {
                    if (typeof payload == "string") {
                        payload = JSON.parse(payload);
                    }
                    await new CommandSelectScenario(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const startGameEventHandler = async (payload) => {
                try {
                    await new CommandStartGame(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const endGameEventHandler = async (payload) => {
                try {
                    await new CommandEndGame(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const voiceEventHandler = async (payload) => {
                try {
                    await new CommandVoice(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            const touchEventHandler = async (payload) => {
                try {
                    await new CommandTouch(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const untouchEventHandler = async (payload) => {
                try {
                    await new CommandUntouch(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const popupchoiceEventHandler = async (payload) => {
                try {
                    if (typeof payload == "string") {
                        payload = JSON.parse(payload);
                    }
                    await new CommandSelectChoicePopUp(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const triangulacionEventHandler = async (payload) => {
                try {
                    await new CommandTriangulacion(this, io, socket).execute(payload);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            }

            //----------------------------------------------------------------------------------

            const stateWriteEventHandler = async (payload) => {
                try {
                    // Se publica a todos
                    const key = this.computeMineKey(payload, socket);
                    this.affectModel(key, payload.val, io);
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(serializeError(err)));
                }
            };

            const stateReadEventHandler = async (payload) => {
                try {
                    // Se lee
                    const key = this.computeMineKey(payload, socket);
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
                    this.state.saveInMemoryTextFile(`${UnrealEngineSocket.ROOT_FOLDER}${payload.fileName}`, payload.base64);
                    io.to(socket.id).emit('personalChat', "Ok");
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
            socket.on(updateCodeEvent, updateCodeEventHandler);
            socket.on(synchronizeFileEvent, synchronizeFileEventHandler);
            socket.on(voiceEvent, voiceEventHandler);
            socket.on(touchEvent, touchEventHandler);
            socket.on(untouchEvent, untouchEventHandler);
            socket.on(popupchoiceEvent, popupchoiceEventHandler);
            socket.on(triangulacionEvent, triangulacionEventHandler);

            io.to(socket.id).emit('stateChanged', JSON.stringify({
                key: "",
                val: this.state.estado
            }));
        };
    }
}
