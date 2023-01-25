import * as os from "os";

export class MySocketStream {
    static handle(io) {
        return (socket) => {
            // convenience function to log server messages on the client
            function log() {
                var array = ['Message from server:'];
                array.push.apply(array, arguments);
                socket.emit('log', array);
            }

            socket.on('message', function (message) {
                log('Client said: ', message);
                // for a real app, would be room-only (not broadcast)
                if (message == "bye") {
                    console.log('received bye');
                    //socket.leave(room);
                }
                socket.broadcast.emit('message', message);
                //io.sockets.in(room).emit('ready');
            });

            socket.on('create or join', function (room) {
                log('Received request to create or join room ' + room);

                console.log("-------------------------------------------------------");
                console.log("inicial", io.sockets.adapter.rooms);

                var clientsInRoom = io.sockets.adapter.rooms.get(room);
                var numClients = clientsInRoom ? clientsInRoom.size : 0;

                log('Room ' + room + ' now has ' + numClients + ' client(s)');

                if (numClients === 0) {
                    console.log("Soy el primero");
                    socket.join(room);
                    log('Client ID ' + socket.id + ' created room ' + room);
                    socket.emit('created', room, socket.id);

                } else if (numClients === 1) {
                    console.log("Soy el segundo");
                    log('Client ID ' + socket.id + ' joined room ' + room);
                    io.sockets.in(room).emit('join', room);
                    socket.join(room);
                    socket.emit('joined', room, socket.id);
                    io.sockets.in(room).emit('ready');
                } else { // max two clients
                    console.log("I'm another!");
                    socket.emit('full', room);
                }

                console.log("final", io.sockets.adapter.rooms);
            });

            socket.on('ipaddr', function () {
                var ifaces = os.networkInterfaces();
                for (var dev in ifaces) {
                    ifaces[dev].forEach(function (details) {
                        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
                            socket.emit('ipaddr', details.address);
                        }
                    });
                }
            });

            socket.on('bye', function (room) {
                console.log("-------------------------------------------------------");
                console.log(`${socket.id} se va de ${room}`);
                console.log("inicial", io.sockets.adapter.rooms);
                socket.leave(room);
                io.sockets.in(room).emit('byeresponse', socket.id);
                console.log("final", io.sockets.adapter.rooms);
            });
        };
    }
}