import { MyDates } from 'srcJs/MyDates';
import { CommandContext, CommandGeneric } from './CommandGeneric';
import sortify from 'srcJs/sortify';

export class CommandChatMessage extends CommandGeneric {
  key: string;
  constructor(context: CommandContext, key: string) {
    super(context);
    this.key = key;
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

  async execute(content: string): Promise<void> {
    //console.log(`[${key}]`);
    // Put it on top
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 5);
    const fecha = MyDates.getDayAsContinuosNumberHmmSS(ahora);
    this.context.messages.unshift(
      `${fecha} [${this.key}] ` + CommandChatMessage.beatyfull(content)
    );
    if (this.context.messages.length > CommandContext.MAX_MESSAGE_LENGTH) {
      this.context.messages.splice(
        CommandContext.MAX_MESSAGE_LENGTH,
        this.context.messages.length - CommandContext.MAX_MESSAGE_LENGTH
      );
    }
  }
}
