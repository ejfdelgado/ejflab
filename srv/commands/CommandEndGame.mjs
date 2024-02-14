import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandEndGame extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("endGame", payload, this.io, this.socket);
        const currentState = this.context.state.readKey("st.current");
        if (currentState == null) {
            throw "El entrenamiento ya está terminado";
        }
        this.context.affectModel("st.current", null, this.io);
    }
}