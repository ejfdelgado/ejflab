import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandStartGame extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("startGame", payload);
        // Se debe validar si ya hay escenario

        if (!(this.context.state.estado?.scene?.id)) {
            throw "Debe seleccionar primero el escenario o el escenario no tiene scene.id!";
        }
        /*
        if (!(this.context.state.estado?.players)) {
            throw "Debe seleccionar los participantes";
        }
        if (Object.keys(this.context.state.estado?.players).length < 2) {
            throw "Debe seleccionar al menos dos participantes";
        }
        */
        //console.log(JSON.stringify(UnrealEngineSocket.HOMOLOGACION_VOZ));
        console.log("Starting game...");

        this.context.goToStartingPoint(this.io, this.socket);
    }
}