import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandVoice extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("voice", payload, this.io, this.socket);
        let voiceHistory = this.context.state.readKey("st.voice");

        if (!(voiceHistory instanceof Array)) {
            voiceHistory = [];
        }
        // reemplazar todo lo que no es texto con vacio
        let sanitized = payload.toLowerCase();
        sanitized = sanitized.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u");
        sanitized = sanitized.replace(/[^a-zñ\s]/ig, '').replace(/\s{2,}/, " ");
        // partir en tokens
        const tokens = sanitized.split(/\s/);
        // crear objeto con fecha
        const ahora = this.context.state.readKey("st.duration");
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i].trim();
            // Se homologa de lo feo a lo que tiene sentido
            if (token in this.context.SINONIMOS_VOZ) {
                // console.log(`${token} => ${this.context.SINONIMOS_VOZ[token]}`);
                token = this.context.SINONIMOS_VOZ[token];
            }
            if (token.length > 0) {
                if (token.length == 1 && ["y", "o", "a"].indexOf(token) < 0) {
                    // De una sola letra solo se acepta y/o/a
                    continue;
                }
                voiceHistory.push({
                    t: ahora,
                    d: token,
                });
            }
        }
        // Se filtran los que tienen X tiempo de antiguedad
        let { changes, voiceHistoryFiltered } = this.context.filterVoiceGap(voiceHistory);
        if (changes) {
            voiceHistory = voiceHistoryFiltered;
        }
        this.context.state.writeKey("st.lastvoice", ahora);

        //this.context.state.writeKey("st.voice", voiceHistory);//Not live
        this.context.affectModel("st.voice", voiceHistory, this.io);//Live
    }
}