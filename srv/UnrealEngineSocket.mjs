import * as os from "os";
import { PoliciaVrMySql } from "./MySqlSrv.mjs";

export class UnrealEngineSocket {

    static clients = [];	//track connected clients
    static chatEvent = "chatMessage";
    static buscarParticipantesEvent = "buscarParticipantes";
    static databaseClient = null;

    static handle(io) {
        return (socket) => {
            const chatEvent = UnrealEngineSocket.chatEvent;
            const buscarParticipantesEvent = UnrealEngineSocket.buscarParticipantesEvent;
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
                if (UnrealEngineSocket.databaseClient == null) {
                    UnrealEngineSocket.databaseClient = new PoliciaVrMySql();
                    await UnrealEngineSocket.databaseClient.connect();
                } else {
                    await UnrealEngineSocket.databaseClient.checkConnection();
                }
                const databaseClient = UnrealEngineSocket.databaseClient;
                const response = await databaseClient.getAllParticipantsByLastNameLetter(inicial);
                io.to(socket.id).emit('buscarParticipantesResponse', JSON.stringify(response));
            });
        };
    }
}