import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { StepGeneric } from "./StepGeneric.mjs";

export class StepCleanVoice extends StepGeneric {
    constructor(context, io, socket, nodeId) {
        super(context, io, socket, nodeId);
    }

    replace(command, value) {
        return command.replace(/\s*cleanvoice\(\)\s*/g, ` ${value} `);
    }

    async handle(command, conditionalEngine) {
        const tokens = /\s*cleanvoice\(\)\s*/.exec(command);
        if (tokens != null) {
            // Se podría leer si es vacío o no
            this.context.affectModel("st.voice", [], this.io);
            const replaced = this.replace(command, "true");
            return replaced;
        }
        // Este step no es el encargado de hacer nada
        return false;
    }
}