import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandSearchUser extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("buscarParticipantes", payload, this.io, this.socket);
        const databaseClient = await this.context.getDataBaseClient();
        const response = await databaseClient.getAllParticipantsByLastNameLetter(payload);
        this.io.to(this.socket.id).emit('buscarParticipantesResponse', JSON.stringify(response));
    }
}