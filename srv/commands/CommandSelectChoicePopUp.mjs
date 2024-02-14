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
        if (popupRef.type == "info") {
            // Ignore
        } else if (popupRef.type == "knowledge") {
            // Check correct answer
            let points = 0;
            popupRef.choices.forEach((choice) => {
                if (choice.val == mychoice) {
                    if (typeof choice.points == "number") {
                        points += choice.points;
                    }
                }
            });
            if (points > 0) {
                const destination = popupRef.destination;
                if (destination instanceof Array) {
                    for (let i = 0; i < destination.length; i++) {
                        const keyPath = destination[i];
                        //console.log(`keyPath = ${keyPath} points = ${points} ${this.socket.id}`);
                        this.context.increaseAmount(this.io, this.socket, keyPath, points);
                    }
                }
            }
        } else if (popupRef.type == "assignment") {
            const destination = popupRef.destination;
            if (destination instanceof Array) {
                for (let i = 0; i < destination.length; i++) {
                    let keyPath = destination[i];
                    keyPath = this.context.replaceUserVars(keyPath, this.socket);
                    //console.log(`keyPath = ${keyPath} mychoice = ${mychoice}`);
                    //this.context.state.writeKey(keyPath, mychoice);//Not live
                    this.context.affectModel(keyPath, mychoice, this.io);//Live
                }
            }
        }
    }
}