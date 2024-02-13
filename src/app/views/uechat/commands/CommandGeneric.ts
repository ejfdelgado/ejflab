import { MyDates } from 'srcJs/MyDates';
import sortify from 'srcJs/sortify';
import { GraphManager } from '../models/GraphManager';

export abstract class CommandContext extends GraphManager {
  static MAX_MESSAGE_LENGTH = 500;
  IMAGES_ROOT = 'assets/word-game/';
  SOUNDS_ROOT = 'assets/police/sounds';
  messages: Array<String> = [];
  listenMode = {
    preview: true,
    complete: true,
  };

  // Open a pop up
  abstract popUpOpen(param: any): Promise<any>;
  // Send message to the server
  abstract emit(key: string, content: string): void;

  setListenMode(preview: boolean, complete?: boolean): void {
    this.listenMode.preview = preview;
    if (typeof complete == 'boolean') {
      this.listenMode.complete = complete;
    }
  }
  static beatyfull(texto: string) {
    try {
      if (typeof texto == 'string') {
        return sortify(JSON.parse(texto));
      } else {
        return sortify(texto);
      }
    } catch (err) {
      return texto;
    }
  }
  receiveChatMessage(key: string, message: any) {
    //console.log(`[${key}]`);
    // Put it on top
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 5);
    const fecha = MyDates.getDayAsContinuosNumberHmmSS(ahora);
    this.messages.unshift(
      `${fecha} [${key}] ` + CommandContext.beatyfull(message)
    );
    if (this.messages.length > CommandContext.MAX_MESSAGE_LENGTH) {
      this.messages.splice(
        CommandContext.MAX_MESSAGE_LENGTH,
        this.messages.length - CommandContext.MAX_MESSAGE_LENGTH
      );
    }
  }
}

export abstract class CommandGeneric {
  context: CommandContext;
  constructor(context: CommandContext) {
    this.context = context;
  }
  abstract execute(content: string): Promise<void>;
}
