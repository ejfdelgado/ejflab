import { SimpleObj } from "../../srcJs/SimpleObj.js";
import { StepGeneric } from "./StepGeneric.mjs";

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

export class StepTriangulacion extends StepGeneric {
    constructor(context, io, socket, nodeId) {
        super(context, io, socket, nodeId);
    }

    replace(command, value) {
        return command.replace(/triangulacion\s*\(([^)]*)\)$/g, ` ${value} `);
    }

    translateVariables(content) {
        return content;
    }

    computeScore() {
        // Debe leer las dos posiciones y calcular la triangulación
        const config = this.context.state.readKey("tri.config");
        const avatars = this.context.state.readKey("tri.avatars");
        /*
        console.log("Step triangulacion");
        console.log(JSON.stringify(config));
        console.log(JSON.stringify(avatars));
        */
        let idBusqueda = -1;
        let idSeguridad = -1;
        if (typeof avatars == "object" && avatars != null) {
            const listOfAvatars = Object.keys(avatars);
            if (listOfAvatars.length >= 2) {
                // Se filtran solo los que tienen val
                const filtered = [];
                const keysFiltered = [];
                for (let i = 0; i < listOfAvatars.length; i++) {
                    const avatarSocketId = listOfAvatars[i];
                    const content = avatars[avatarSocketId];
                    if (typeof content.val == "object" && content.val != null) {
                        filtered.push(this.translateVariables(content));
                        keysFiltered.push(avatarSocketId);
                        if (content.role == "busqueda") {
                            idBusqueda = i;
                        }
                        if (content.role == "seguridad") {
                            idSeguridad = i;
                        }
                    }
                }
                // Se interpreta
                if (filtered.length == 1) {
                    // Solo hay uno y se asume busqueda
                    idBusqueda = 0;
                    idSeguridad = -1;
                } else if (filtered.length >= 2) {
                    if (idBusqueda >= 0) {
                        switch (idBusqueda) {
                            case 0:
                                idSeguridad = 1;
                            case 1:
                                idSeguridad = 0;
                            default:
                                idSeguridad = -1;
                        }
                    }
                }
            }
        }
        // Intento organiza primero el de busqueda y después el de seguridad

        //console.log("Triangulación, NO se puede calcular! [2]");
        return {
            config,
            avatars: [],
            done: false
        };
    }

    async handle(command, conditionalEngine) {
        const tokensTri = /\s*triangulacion\s*\(([^)]*)\)/.exec(command);
        if (tokensTri != null) {
            const tokensWriteDB = /^\s*triangulacion\s*\(([^)]*)\)$/.exec(command);
            const computed = this.computeScore();
            this.context.sendCommand('updatetri', computed, this.io);
        }
        return this.replace(command, "true");
    }
}