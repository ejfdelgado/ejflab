import md5 from "md5";
import mm from 'music-metadata';
import sortify from "../../srcJs/sortify.js";
import { serializeError } from 'serialize-error';
import { CommandGeneric } from "./CommandGeneric.mjs";
import { CollisionsEngine } from "../../srcJs/CollisionsEngine.js";
import { MyUtilities } from "../../srcJs/MyUtilities.js";
import { MyTemplate } from "../../srcJs/MyTemplate.js";
import { CsvFormatterFilters } from "../../srcJs/CsvFormatterFilters.js";
import { StepPopUpOpen } from "../steps/StepPopUpOpen.mjs";
import { StepWriteDB } from "../steps/StepWriteDB.mjs";
import { StepTriangulacion } from "../steps/StepTriangulacion.mjs";
import { StepCleanVoice } from "../steps/StepCleanVoice.mjs";

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

export class CommandStep extends CommandGeneric {
    static ONE_TIME_ARROWS = {};
    static GLOBAL_ONE_TIME_ARROWS = {};
    static GAME_INTERVAL = 2000;
    static collisionEngine = new CollisionsEngine();
    static conditionalEngine = new MyTemplate();

    static {
        CommandStep.conditionalEngine.registerFunction("rand", CsvFormatterFilters.rand);
        CsvFormatterFilters.formatRandomMemory();
        // Se cargan las homologaciones de voz
    }

    constructor(context, io, socket) {
        super(context, io, socket);
    }

    static reset() {
        CommandStep.ONE_TIME_ARROWS = {};
        CommandStep.GLOBAL_ONE_TIME_ARROWS = {};
        CommandStep.collisionEngine = new CollisionsEngine();
        CommandStep.conditionalEngine.registerFunction("rand", CsvFormatterFilters.rand);
        CsvFormatterFilters.formatRandomMemory();
    }

    async execute() {
        const history = this.context.state.readKey("st.history");
        let currentState = this.context.state.readKey("st.current");
        const startedAt = this.context.state.readKey("st.startedAt");
        let interval = this.context.state.readKey("scene.interval");
        let collisionMemory = this.context.state.readKey("st.touch");
        const collisionEngine = CommandStep.collisionEngine;
        const conditionalEngine = CommandStep.conditionalEngine;
        collisionEngine.startSession();
        if (!collisionMemory) {
            collisionMemory = {};
        }

        if (!(typeof interval == "number")) {
            interval = CommandStep.GAME_INTERVAL;
        }
        if (currentState == null) {
            // El juego ya terminó
            collisionEngine.endSession();
            return;
        }
        const graph = this.context.state.readKey("zflowchart");
        const arrows = graph.arrows;
        const shapes = graph.shapes;
        //console.log(`Evaluating next steps from ${JSON.stringify(currentState)}`);

        // FLECHAS !!! ------------------------------------------------------------------------------
        // Validar las FLECHAS y tomar todas las que sean verdaderas
        const outputPositiveGlobal = {};
        const outputArrowsReset = [];
        const currentTime = this.context.state.readKey("st.duration");
        for (let i = 0; i < currentState.length; i++) {
            const srcId = currentState[i];
            const outputArrows = filterSourceArrowsFromSource(arrows, srcId);
            if (outputArrows.length > 0) {
                const silenceArrowKeys = [];
                const timerArrowKeys = [];
                const arrowChooseGroups = {};
                const temporalArrowsPositive = {};
                let atLeastOneOutput = false;
                let arrowsReset = false;
                // Este nodo se debe validar si cumple al menos una salida
                for (let j = 0; j < outputArrows.length; j++) {
                    const outputArrow = outputArrows[j];
                    const srcNode = findNodeById(shapes, outputArrow.src);
                    const hasChoose = /choose\((\d+)\)/ig.exec(srcNode.txt);
                    const arrowId = outputArrow.id;
                    if (hasChoose) {
                        if (!(arrowChooseGroups[srcNode.id])) {
                            arrowChooseGroups[srcNode.id] = {
                                n: parseInt(hasChoose[1]),
                                list: [],
                            };
                        }
                        arrowChooseGroups[srcNode.id].list.push(arrowId);
                    }
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
                                    if (typeof CommandStep.GLOBAL_ONE_TIME_ARROWS[arrowId] == "number") {
                                        textoIf = "false";
                                    }
                                } else if (typeof CommandStep.ONE_TIME_ARROWS[arrowId] == "number") {
                                    textoIf = "false";
                                }
                            }
                            // Se valida si la flecha tiene arrowsreset()
                            textoIf = textoIf.replace(/arrowsreset\s*\(\s*\)/ig, () => {
                                arrowsReset = true;
                                return "true";
                            });

                            // Se hace manejo de popup en flechas
                            const stepPopUpResponse = (await (new StepPopUpOpen(this.context, this.io, this.socket, arrowId).handle(textoIf, CommandStep.conditionalEngine)));
                            if (typeof stepPopUpResponse == "string") {
                                textoIf = stepPopUpResponse;
                            }

                            // Write DB
                            const stepWriteDBResponse = (await (new StepWriteDB(this.context, this.io, this.socket, arrowId).handle(textoIf, CommandStep.conditionalEngine)));
                            if (typeof stepWriteDBResponse == "string") {
                                textoIf = stepWriteDBResponse;
                            }

                            // Se hace manejo de clean voice
                            const stepCleanVoiceResponse = (await (new StepCleanVoice(this.context, this.io, this.socket, arrowId).handle(textoIf, CommandStep.conditionalEngine)));
                            if (typeof stepCleanVoiceResponse == "string") {
                                textoIf = stepCleanVoiceResponse;
                            }

                            const stepTriResponse = (await (new StepTriangulacion(this.context, this.io, this.socket, arrowId).handle(textoIf, CommandStep.conditionalEngine)));
                            if (typeof stepTriResponse == "string") {
                                textoIf = stepTriResponse;
                            }

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
                            //console.log(textoIf);
                            textoIf = await MyUtilities.replaceAsync(textoIf, /call\s*\(([^)]+)\)/ig, async (command) => {
                                const callArgs = MyTemplate.readCall(command, this.context.state.estado);
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
                                                    //1. archivo
                                                    //2. loop o ""
                                                    //3. quién
                                                    //4. duration
                                                    //5. volume
                                                    const duration = parseInt(durationMillis);
                                                    if (callArgs.arguments.length == 1) {
                                                        callArgs.arguments.push("");//No loop
                                                        callArgs.arguments.push("");//Nadie
                                                        callArgs.arguments.push(duration);
                                                        callArgs.arguments.push(100);
                                                    } else if (callArgs.arguments.length == 2) {
                                                        callArgs.arguments.push("");//Nadie
                                                        callArgs.arguments.push(duration);
                                                        callArgs.arguments.push(100);
                                                    } else if (callArgs.arguments.length == 3) {
                                                        callArgs.arguments.push(duration);
                                                        callArgs.arguments.push(100);
                                                    } else if (callArgs.arguments.length == 4) {
                                                        const volume = callArgs.arguments[3];
                                                        callArgs.arguments[3] = duration;
                                                        callArgs.arguments.push(volume);
                                                    }
                                                    const name = `,${filename}`;
                                                    const arrowIdTimer = `${arrowId}_${md5(name)}`;
                                                    const timerKey = `timer.${arrowIdTimer}`;
                                                    const oldTimer = this.context.state.readKey(timerKey);
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
                                            this.context.sendCommand(callArgs.action, "", this.io);
                                        } else if (callArgs.arguments.length == 1) {
                                            this.context.sendCommand(callArgs.action, callArgs.arguments[0], this.io);
                                        } else {
                                            this.context.sendCommand(callArgs.action, callArgs.arguments, this.io);
                                        }
                                    }
                                }
                                return replaceValue;
                            });
                            //console.log(textoIf);
                            // Se hace manejo de sleep(###)
                            if (/sleep\(([^),]*)([^)]*)\)/ig.exec(textoIf) != null) {
                                textoIf = textoIf.replace(/sleep\(([^),]*)([^)]*)\)/ig, (match, tiempo, name) => {
                                    let arrowIdTimer = arrowId;
                                    if (typeof name == "string" && name.length > 0) {
                                        arrowIdTimer += "_" + md5(name);
                                    }
                                    const timerKey = `timer.${arrowIdTimer}`;
                                    timerArrowKeys.push(arrowIdTimer);
                                    const oldTimer = this.context.state.readKey(timerKey);

                                    if (!(typeof oldTimer == "number")) {
                                        this.context.state.writeKey(timerKey, currentTime);
                                    }
                                    try {
                                        const renderedTime = conditionalEngine.computeIf(tiempo, this.context.state.estado);
                                        //console.log(`renderedTime = ${renderedTime}`);
                                        return "${st.duration} - ${timer." + arrowIdTimer + "} > " + renderedTime;
                                    } catch (err1) {
                                        this.io.to(this.socket.id).emit('personalChat', sortify(serializeError(err1)));
                                        return "false";
                                    }
                                });
                            }
                            //console.log(textoIf);
                            // Se hace manejo de silence()
                            if (/silence\(\s*\)/ig.exec(textoIf) != null) {
                                textoIf = textoIf.replace(/silence\(\s*\)/ig, "${st.duration} - ${st.lastvoice} > ${scene.voz_segundos_buffer}*1000");
                                const silencesKey = `silences.${arrowId}`;
                                silenceArrowKeys.push(arrowId);
                                const oldSilenceValue = this.context.state.readKey(silencesKey);
                                if (!(typeof oldSilenceValue == "number")) {
                                    this.context.state.writeKey(silencesKey, currentTime);
                                    this.context.state.writeKey("st.lastvoice", currentTime);
                                }
                            }
                            // Se hace manejo de voice(...)

                            textoIf = textoIf.replace(/voice\(([^)]*)\)/ig, (wholeMatch, searchedText) => {
                                // Se debe validar si este texto existe en el record de voz
                                // La voz puede requerir interpolación
                                try {
                                    searchedText = conditionalEngine.computeIf(searchedText, this.context.state.estado);
                                } catch (err5) {
                                    // Muere silenciosamente
                                }
                                if (this.context.voiceDetection(searchedText)) {
                                    return "true";
                                } else {
                                    return "false";
                                }
                            });
                            evaluated = conditionalEngine.computeIf(textoIf, this.context.state.estado);
                            //console.log(`${evaluated}=${textoIf}`);
                        }
                        if (evaluated) {
                            temporalArrowsPositive[arrowId] = { outputArrow, isOneTimeArrow, isGlobalOneTimeArrow };
                            // Acciones que se hacen cuando una flecha ya dió positiva
                            const keyCleaned = `popupmemory.handled.${srcNode.id}`;
                            const old = this.context.state.readKey(keyCleaned);
                            if ([undefined, null].indexOf(old) < 0) {
                                //console.log(`Clean node ${keyCleaned}`);
                                this.context.state.writeKey(keyCleaned, undefined);
                            }
                        }
                    } catch (err) {
                        this.io.to(this.socket.id).emit('personalChat', sortify(serializeError(err)));
                    }
                }

                // Acá se podría filtrar
                const llavesOutputArrows = Object.keys(temporalArrowsPositive);
                const llavesArrowGroups = Object.keys(arrowChooseGroups);
                const removedList = [];
                for (let z = 0; z < llavesArrowGroups.length; z++) {
                    const llave = llavesArrowGroups[z];
                    const arrowGroup = arrowChooseGroups[llave];
                    const { n, list } = arrowGroup;
                    // 1. Hago la intersección entre list y llavesOutputArrows
                    const intersecion = llavesOutputArrows.filter((actual) => {
                        return list.indexOf(actual) >= 0;
                    });
                    // 2. Debo asegurar que la intersección tiene solo n elementos y además aleatorios
                    while (intersecion.length > n) {
                        const removed = intersecion.splice(Math.floor(Math.random() * intersecion.length), 1);
                        if (removed.length == 1) {
                            removedList.push(removed[0]);
                        }
                    }
                }

                for (let z = 0; z < llavesOutputArrows.length; z++) {
                    const arrowId = llavesOutputArrows[z];
                    if (removedList.indexOf(arrowId) >= 0) {
                        continue;
                    }
                    const { outputArrow, isOneTimeArrow, isGlobalOneTimeArrow } = temporalArrowsPositive[arrowId];
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
                        CommandStep.ONE_TIME_ARROWS[arrowId] = currentTime;
                        if (isGlobalOneTimeArrow) {
                            CommandStep.GLOBAL_ONE_TIME_ARROWS[arrowId] = currentTime;
                        }
                    }
                }

                if (atLeastOneOutput) {
                    // Se limpian las marcas temporales de salida
                    for (let k = 0; k < silenceArrowKeys.length; k++) {
                        const arrowId = silenceArrowKeys[k];
                        const silencesKey = `silences.${arrowId}`;
                        this.context.state.writeKey(silencesKey, null);
                    }
                    for (let k = 0; k < timerArrowKeys.length; k++) {
                        const arrowId = timerArrowKeys[k];
                        const silencesKey = `timer.${arrowId}`;
                        this.context.state.writeKey(silencesKey, null);
                    }

                }
            }
        }

        // NODOS ------------------------------------------------------------------------------------
        // Ejecución de los nodos donde llega
        // Se hace el cambio
        let forceFinish = false;
        const flechasHabilitadas = Object.keys(outputPositiveGlobal);
        // Esto asegura que no se ejecute un nodo de llegada dos veces
        const executedNodesIds = [];
        for (let i = 0; i < flechasHabilitadas.length; i++) {
            const srcId = flechasHabilitadas[i];
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
                if (executedNodesIds.indexOf(nodoLlegada) < 0) {
                    // Esto asegura que no se ejecute un nodo de llegada dos veces
                    executedNodesIds.push(nodoLlegada);
                    let esNodoDeFinalizacion = false;
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
                                if (/^\s*ok\s*$/.exec(command) != null) {
                                    esNodoDeFinalizacion = true;
                                    continue;
                                }
                                // Se valida si es clean voice
                                if (typeof (await (new StepCleanVoice(this.context, this.io, this.socket, theNode.id).handle(command, CommandStep.conditionalEngine))) == "string") {
                                    continue;
                                }
                                // Si es un comando para las flechas...
                                if (/^\s*choose\(([^)]+)\)/ig.exec(command) != null) {
                                    //console.log(`Next choose only some arrows`);
                                    continue;
                                }
                                // Se valida si es un comando call{sound, param, param}
                                const callArgs = MyTemplate.readCall(command, this.context.state.estado);
                                if (callArgs.action != null) {
                                    // Se ejecuta la acción
                                    //console.log(`call ${callArgs.action}`);
                                    if (callArgs.action == "sound") {
                                        if (callArgs.arguments.length == 2) {
                                            callArgs.arguments.push("");
                                            callArgs.arguments.push(0);
                                        }
                                    }
                                    if (callArgs.length == 0) {
                                        this.context.sendCommand(callArgs.action, "", this.io);
                                    } else if (callArgs.arguments.length == 1) {
                                        this.context.sendCommand(callArgs.action, callArgs.arguments[0], this.io);
                                    } else {
                                        this.context.sendCommand(callArgs.action, callArgs.arguments, this.io);
                                    }
                                } else {
                                    // se valida si es increase(...)
                                    const tokensIncrease = /^\s*increase\s*\(([^)]+)\)$/.exec(command);
                                    if (tokensIncrease != null) {
                                        this.context.increaseAmount(this.io, this.socket, tokensIncrease[1], 1);
                                        continue;
                                    }
                                    if (typeof (await (new StepPopUpOpen(this.context, this.io, this.socket, theNode.id).handle(command, CommandStep.conditionalEngine))) == "string") {
                                        continue;
                                    }
                                    if (typeof (await (new StepWriteDB(this.context, this.io, this.socket, theNode.id).handle(command, CommandStep.conditionalEngine))) == "string") {
                                        continue;
                                    }
                                    /*
                                    if (typeof (await (new StepTriangulacion(this.context, this.io, this.socket, theNode.id).handle(command, CommandStep.conditionalEngine))) == "string") {
                                        continue;
                                    }
                                    */
                                    // Default way to resolve node actions
                                    const tokensCommand = /^\s*[$]{\s*([^}]+)\s*[}]\s*=(.*)$/ig.exec(command);
                                    if (tokensCommand != null) {
                                        const destinationVar = tokensCommand[1];
                                        const preProcesedValue = tokensCommand[2];
                                        try {
                                            const value = conditionalEngine.computeIf(preProcesedValue, this.context.state.estado);
                                            //console.log(`destinationVar = ${destinationVar} preProcesedValue = ${preProcesedValue} value = ${value}`);
                                            this.context.affectModel(destinationVar, value, this.io);
                                        } catch (err1) {
                                            this.io.to(this.socket.id).emit('personalChat', sortify(serializeError(err1)));
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!esNodoDeFinalizacion) {
                        currentState.push(nodoLlegada);
                    }
                }

                //console.log(`vamos en ${JSON.stringify(currentState)}`);
                history.push({ id: theNode.id, t: currentTime, type: "node", txt: theNode.txt });
                // Se valida si llegó a este nodo por medio de una flecha con arrowsreset()
                if (outputArrowsReset.indexOf(nodoLlegada) >= 0) {
                    // Se deben borrar los ids de las flechas de salida de este nodo
                    const outputArrowsNext = filterSourceArrowsFromSource(arrows, nodoLlegada);
                    for (let k = 0; k < outputArrowsNext.length; k++) {
                        const outputArrow = outputArrowsNext[k];
                        const arrowId = outputArrow.id;
                        delete CommandStep.ONE_TIME_ARROWS[arrowId];
                    }
                }
            }
        }
        // Se debe eliminar duplicados
        currentState = currentState.filter((value, index) => {
            return currentState.indexOf(value) === index;
        });
        const nuevosSt = {
            duration: new Date().getTime() - startedAt,
        };
        if (flechasHabilitadas.length > 0) {
            nuevosSt.history = history;
            nuevosSt.current = currentState;
        }
        if (forceFinish) {
            nuevosSt.current = null;
        }
        //console.log(`Escribiendo ${JSON.stringify(nuevosSt)}`);
        this.context.affectModel("st", nuevosSt, this.io);
        collisionEngine.endSession();

        setTimeout(() => {
            this.context.moveState(this.io, this.socket);
        }, interval);
    }
}