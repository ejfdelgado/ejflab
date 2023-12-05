import * as os from "os";
import sortify from "../srcJs/sortify.js";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";

export class UnrealEngineSocket {

    static clients = [];	//track connected clients
    static chatEvent = "chatMessage";
    static buscarParticipantesEvent = "buscarParticipantes";
    static createScoreEvent = "createScore";
    static updateScoreEvent = "updateScore";

    static databaseClient = null;

    static async getDataBaseClient() {
        if (UnrealEngineSocket.databaseClient == null) {
            UnrealEngineSocket.databaseClient = new PoliciaVrMySql();
            await UnrealEngineSocket.databaseClient.connect();
        } else {
            await UnrealEngineSocket.databaseClient.checkConnection();
        }
        return UnrealEngineSocket.databaseClient;
    }

    static handle(io) {
        return (socket) => {
            const chatEvent = UnrealEngineSocket.chatEvent;
            const buscarParticipantesEvent = UnrealEngineSocket.buscarParticipantesEvent;
            const createScoreEvent = UnrealEngineSocket.createScoreEvent;
            const updateScoreEvent = UnrealEngineSocket.updateScoreEvent;

            const clients = UnrealEngineSocket.clients;
            // convenience function to log server messages on the client
            // track connected clients via log
            clients.push(socket.id);
            const clientConnectedMsg = 'User connected ' + (socket.id) + ', total: ' + clients.length;
            io.emit(chatEvent, clientConnectedMsg);
            console.log(clientConnectedMsg);

            io.on("connection", async (socket) => {
                //console.log(`Creating room for ${socket.id}`);
                socket.join(socket.id);
            });

            // track disconnected clients via log
            socket.on('disconnect', () => {
                clients.pop(socket.id);
                const clientDisconnectedMsg = 'User disconnected ' + (socket.id) + ', total: ' + clients.length;
                io.emit(chatEvent, clientDisconnectedMsg);
                //console.log(clientDisconnectedMsg);
            })

            // multicast received message from client
            socket.on(chatEvent, msg => {
                const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
                io.emit(chatEvent, combinedMsg);
                //console.log('multicast: ' + combinedMsg);
            });

            socket.on(buscarParticipantesEvent, async (inicial) => {
                const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                const response = await databaseClient.getAllParticipantsByLastNameLetter(inicial);
                io.to(socket.id).emit('buscarParticipantesResponse', JSON.stringify(response));
            });

            socket.on(createScoreEvent, async (payload) => {
                const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                try {
                    const insertedId = await databaseClient.createScore(payload.personId, payload.sceneId);
                    const created = await databaseClient.readScore(insertedId);
                    io.to(socket.id).emit('personalChat', JSON.stringify(created));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(err));
                }
            });

            socket.on(updateScoreEvent, async (payload) => {
                const databaseClient = await UnrealEngineSocket.getDataBaseClient();
                try {
                    await databaseClient.updateScore(payload.id, payload.column, payload.value);
                    const changed = await databaseClient.readScore(payload.id);
                    io.to(socket.id).emit('personalChat', JSON.stringify(changed));
                } catch (err) {
                    io.to(socket.id).emit('personalChat', sortify(err));
                }
            });
        };
    }
}