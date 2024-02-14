import { CommandGeneric } from "./CommandGeneric.mjs";
import { CommandStep } from "./CommandStep.mjs";

export class CommandTouch extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("touch", payload, this.io, this.socket);
        let memory = this.context.state.readKey("st.touch");
        if (!memory) {
            memory = {};
        }
        const partes = payload.split(/\W/);
        const key = partes[0];
        const objectKey = partes[1];
        const changed = CommandStep.collisionEngine.collide(memory, key, objectKey);
        if (changed) {
            //this.state.writeKey("st.touch", memory);//Not live
            this.context.affectModel("st.touch", memory, this.io);//Live
        }
    }
}