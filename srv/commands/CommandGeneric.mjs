
function checkHasMethods(instance, names) {
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        if (instance.hasOwnProperty(name)) {
            const ref = instance[name];
            if (typeof ref != "function") {
                throw Error(`La instancia ${instance} debe implementar el método ${name} pero parece ser un atributo`);
            }
        } else {
            throw Error(`La instancia ${instance} debe implementar el método ${name}`);
        }
    }
}

export class CommandContext {
    constructor() {

    }
}

export class CommandGeneric {
    constructor(context, io, socket) {
        checkHasMethods(context, ["goToStartingPoint", "echoCommand", "affectModel", "sendCommand", "filterVoiceGap", "readVoice", "voiceDetection"]);
        //checkHasMethods(this, ["execute"]);
        this.context = context;
        this.io = io;
        this.socket = socket;
    }
}