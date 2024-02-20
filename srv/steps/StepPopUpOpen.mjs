import { StepGeneric } from "./StepGeneric.mjs";

export class StepPopUpOpen extends StepGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    replace(command, value) {
        return command.replace(/popup\s*\(([^)]+)\)$/g, value);
    }

    async handle(command, conditionalEngine, nodeType) {
        const tokensPopUp = /^\s*popup\s*\(([^)]+)\)$/.exec(command);
        if (tokensPopUp != null) {
            console.log(`handle ${nodeType} ${command}`);
            const popupKey = tokensPopUp[1].trim();
            const currentValue = this.context.state.readKey(popupKey);
            if (!currentValue) {
                console.log(`Error leyendo popup de ${popupKey}`);
                if (nodeType == "node") {
                    return true;
                } else if (nodeType == "arrow") {
                    return this.replace(command, "true");
                }
            }
            // Verifico si realmente se debe mostrar
            const requirement = currentValue.requirement;
            if (typeof requirement == "string") {
                // Se evalúa para saber si da verdadero o falso
                const value = conditionalEngine.computeIf(requirement, this.context.state.estado);
                if (value == false) {
                    // Si se resuelve que no lo debe mostrar, finaliza.
                    if (nodeType == "node") {
                        return true;
                    } else if (nodeType == "arrow") {
                        return this.replace(command, "true");
                    }
                }
            }
            // Asigno la ruta como call back id para cuando el usuario seleccione una opción se pueda asociar a algo
            currentValue.callback = popupKey;
            this.context.sendCommand('popupopen', currentValue, this.io);

            // Este step si fue el encargado
            if (nodeType == "node") {
                return true;
            } else if (nodeType == "arrow") {
                // Primero valida si tiene timeout, si sí, entonces se usa
                if (typeof currentValue.timeout == "number") {
                    return this.replace(command, `sleep(${currentValue.timeout})`);
                } else {
                    return this.replace(command, "true");
                }
            }
        }

        // Este step no es el encargado de hacer nada
        if (nodeType == "node") {
            return false;
        } else if (nodeType == "arrow") {
            return command;
        }
    }
}