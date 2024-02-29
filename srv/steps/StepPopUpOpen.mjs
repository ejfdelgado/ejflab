import { StepGeneric } from "./StepGeneric.mjs";

export class StepPopUpOpen extends StepGeneric {
    constructor(context, io, socket, nodeId) {
        super(context, io, socket, nodeId);
    }

    replace(command, value) {
        return command.replace(/popup\s*\(([^)]+)\)$/g, ` ${value} `);
    }

    async handle(command, conditionalEngine) {
        const tokensPopUp = /\s*popup\s*\(([^)]+)\)/.exec(command);
        if (tokensPopUp != null) {
            //console.log(`handle ${nodeType} ${command}`);
            const popupKey = tokensPopUp[1].trim();
            // Esta llave deja el rastro de que se imprimió el popup
            const keyWrited = `popupmemory.handled.${this.nodeId}.${popupKey}`;

            // Se lee la configuración del popup
            const currentValue = this.context.state.readKey(popupKey);
            if (!currentValue) {
                console.log(`No existe popup con identificador ${popupKey}`);
                return this.replace(command, "true");
            }

            // Verifico si realmente se debe mostrar
            const requirement = currentValue.requirement;
            if (typeof requirement == "string") {
                // Se evalúa para saber si da verdadero o falso
                const value = conditionalEngine.computeIf(requirement, this.context.state.estado);
                //console.log(`conditional ${value}=${requirement}`);
                if (value == false) {
                    // Si se resuelve que no lo debe mostrar, finaliza.
                    return this.replace(command, "true");
                }
            }
            // Asigno la ruta como call back id para cuando el usuario seleccione una opción se pueda asociar a algo
            currentValue.callback = popupKey;

            let showPopUp = true;
            // Se valida la cantidad de impresiones si la hay
            const keyPrintCount = `popupmemory.count.${popupKey}`;
            let popupCount = this.context.state.readKey(keyPrintCount);
            if (!(typeof popupCount == "number")) {
                popupCount = 0;
            }
            //console.log(JSON.stringify(currentValue, null, 4));
            if (currentValue.onetime !== false) {
                if (popupCount > 0) {
                    // Debe ignorarse esta ejecución
                    showPopUp = false;
                }
            }
            //console.log(`showPopUp = ${showPopUp}`);
            if (showPopUp) {
                // Se incrementa y deja continuar
                popupCount++;
                this.context.state.writeKey(keyPrintCount, popupCount);
            }
            //console.log(`popupCount = ${popupCount} currentValue.onetime = ${currentValue.onetime} showPopUp = ${showPopUp}`);

            // Este step si fue el encargado
            // Primero valida si tiene timeout, si sí, entonces se usa
            let resolvedText = "true";
            //console.log(`${popupKey} ${currentValue.timeout}`);
            if (typeof currentValue.timeout == "number") {
                // Solo envía el popup open la primera vez
                const wasFiredInThisNode = this.context.state.readKey(keyWrited);
                if (wasFiredInThisNode !== true) {
                    //console.log(`Writing ${keyWrited} with true`);
                    this.context.state.writeKey(keyWrited, true);
                    if (showPopUp) {
                        this.context.sendCommand('popupopen', currentValue, this.io);
                        this.context.sendCommand("sound", ["common/popup.mp3", "", "", 0], this.io);
                    }
                }
                resolvedText = this.replace(command, `sleep(${currentValue.timeout})`);
            } else {
                //console.log(`Writing ${keyWrited} with true`);
                this.context.state.writeKey(keyWrited, true);
                if (showPopUp) {
                    this.context.sendCommand('popupopen', currentValue, this.io);
                    this.context.sendCommand("sound", ["common/popup.mp3", "", "", 0], this.io);
                }
                resolvedText = this.replace(command, "true");
            }
            return resolvedText;
        }
        // Este step no es el encargado de hacer nada
        return false;
    }
}