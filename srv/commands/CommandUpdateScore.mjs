import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandUpdateScore extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("updateScore", payload, this.io, this.socket);
        const databaseClient = await this.context.getDataBaseClient();
        await databaseClient.updateScore(payload.id, payload.column, payload.value);
        const changed = await databaseClient.readScore(payload.id);
        this.io.to(this.socket.id).emit('personalChat', JSON.stringify(changed));
    }
}