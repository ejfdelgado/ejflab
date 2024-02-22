import { CommandGeneric } from "./CommandGeneric.mjs";

const sample = {
    avatars: {
        LhQZAEpsPsxAHbBqAAAB: {
            role: "seguridad",
            val: {
                LookAt: {
                    X: 0.7155819531358335,
                    Y: -0.6985287884878516,
                    Z: 0
                },
                Traslation: {
                    X: 70.80268211616175,
                    Y: 141.7631341391875,
                    Z: 99.52108919413729
                }
            }
        },
        _lyMFH92bI1Vmsy2AAAD: {
            role: "busqueda",
            val: {
                LookAt: {
                    X: 0.7155819531358335,
                    Y: -0.6985287884878516,
                    Z: 0
                },
                Traslation: {
                    X: 70.80268211616175,
                    Y: 141.7631341391875,
                    Z: 99.52108919413729
                }
            }
        }
    }
};

export class CommandTriangulacion extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    computeScore() {
        // Debe leer las dos posiciones y calcular la triangulación
        const avatars = this.context.state.readKey("tri.avatars");
        if (typeof avatars == "object" && avatars != null) {
            const listOfAvatars = Object.keys(avatars);
            if (listOfAvatars.length >= 2) {
                // Se filtran solo los que tienen val
                const filtered = {};
                const keysFiltered = [];
                for (let i = 0; i < listOfAvatars.length; i++) {
                    const avatarSocketId = listOfAvatars[i];
                    const content = avatars[avatarSocketId];
                    if (typeof content.val == "object" && content.val != null) {
                        filtered[avatarSocketId] = content;
                        keysFiltered.push(avatarSocketId);
                    }
                    if (keysFiltered.length >= 2) {
                        console.log("Triangulación, se puede calcular!");
                        // Se debe decidir quién es búsqueda y quién es seguridad
                        
                        return;
                    }
                }
            }
        }
        console.log("Triangulación, NO se puede calcular! [2]");
    }

    async execute(payload) {
        this.context.echoCommand("triangulacion", payload, this.io, this.socket);
        const triangulacionKey = `tri.avatars.${this.socket.id}.val`;
        this.context.affectModel(triangulacionKey, payload, this.io);
        this.computeScore();
    }
}