import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandTriangulacion extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("triangulacion", payload, this.io, this.socket);
        const triangulacionKey = `tri.avatars.${this.socket.id}.val`;
        this.context.affectModel(triangulacionKey, payload, this.io);
    }
}