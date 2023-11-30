import * as os from "os";

export class UnrealEngineSocket {

    static clients = [];	//track connected clients
    static chatEvent = "chatMessage";

    static handle(io) {
        return (socket) => {
            // convenience function to log server messages on the client
            // track connected clients via log
            clients.push(socket.id);
            const clientConnectedMsg = 'User connected ' + util.inspect(socket.id) + ', total: ' + clients.length;
            io.emit(chatEvent, clientConnectedMsg);
            console.log(clientConnectedMsg);

            // track disconnected clients via log
            socket.on('disconnect', () => {
                clients.pop(socket.id);
                const clientDisconnectedMsg = 'User disconnected ' + util.inspect(socket.id) + ', total: ' + clients.length;
                io.emit(chatEvent, clientDisconnectedMsg);
                console.log(clientDisconnectedMsg);
            })

            // multicast received message from client
            socket.on(chatEvent, msg => {
                const combinedMsg = socket.id.substring(0, 4) + ': ' + msg;
                io.emit(chatEvent, combinedMsg);
                console.log('multicast: ' + combinedMsg);
            });
        };
    }
}