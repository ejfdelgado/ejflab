import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandVoice extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {

    }
}