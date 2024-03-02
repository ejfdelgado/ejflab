import { CommandGeneric } from "./CommandGeneric.mjs";

export class CommandSelectChoicePopUp extends CommandGeneric {
    constructor(context, io, socket) {
        super(context, io, socket);
    }

    async execute(payload) {
        this.context.echoCommand("popupchoice", payload, this.io, this.socket);
        //console.log(`PopUp Choice ${JSON.stringify(payload)}`);
        const popupRef = this.context.state.readKey(payload.callback);
        const mychoice = payload.choice;
        if (["info", "feedback"].indexOf(popupRef.type) >= 0) {
            // Ignore
        } else if (popupRef.type == "knowledge") {
            // Check correct answer
            let points = 0;
            let emptySelect = true;
            popupRef.choices.forEach((choice) => {
                if (choice.val == mychoice) {
                    emptySelect = false;
                    if (typeof choice.points == "number") {
                        points += choice.points;
                    }
                }
            });
            const wildcard = "popupcheck." + payload.callback;
            this.context.writeUniversal(wildcard, true, this.io, true);// it means a choice was selected
            if (!emptySelect) {
                if (points > 0) {
                    const destination = popupRef.destination;
                    if (destination instanceof Array) {
                        for (let i = 0; i < destination.length; i++) {
                            const keyPath = destination[i];
                            //console.log(`keyPath = ${keyPath} points = ${points} ${this.socket.id}`);
                            this.context.increaseAmount(this.io, this.socket, keyPath, points);
                        }
                    }
                    // Feedback increase
                    this.context.sendCommand("sound", ["common/point.mp3", "", "", 0], this.io);
                } else {
                    // Feedback error
                    this.context.sendCommand("sound", ["common/error.mp3", "", "", 0], this.io);
                }
            }
        } else if (popupRef.type == "assignment") {
            const destination = popupRef.destination;
            if (destination instanceof Array) {
                for (let i = 0; i < destination.length; i++) {
                    let keyPath = destination[i];
                    keyPath = this.context.replaceUserVars(keyPath, this.socket);
                    //console.log(`keyPath = ${keyPath} mychoice = ${mychoice}`);
                    const publish = true;
                    this.context.writeUniversal(keyPath, mychoice, this.io, publish);
                }
            }
        }
    }
}