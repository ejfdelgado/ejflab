import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandCreateScore extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {

    }
}