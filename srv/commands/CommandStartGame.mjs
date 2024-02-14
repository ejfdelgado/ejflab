import { CommandGeneric } from "./CommandGeneric.mjs";
import { CommandStep } from "./CommandStep.mjs";

export class CommandStartGame extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("startGame", payload, this.io, this.socket);
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

        //console.log(`goToStartingPoint`);
        const currentState = this.context.state.readKey("st.current");
        let interval = this.context.state.readKey("scene.interval");
        if (!(typeof interval == "number")) {
            interval = CommandStep.GAME_INTERVAL;
        }
        if (currentState != null) {
            throw `El entrenamiento ya está iniciado y está corriendo`;
        }
        const nodeIds = this.context.state.getIdNodeWithText("inicio");
        //console.log(`nodeIds = ${JSON.stringify(nodeIds)}`);
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
        this.context.state.writeKey("timer", {});
        this.context.state.writeKey("silences", {});
        CommandStep.reset();
        // Inicialización
        this.context.affectModel("st", nuevosSt, this.io);
        setTimeout(() => {
            this.context.moveState(this.io, this.socket);
        }, interval);
    }
}