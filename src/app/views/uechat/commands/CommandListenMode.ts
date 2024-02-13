import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandListenMode extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumentos = JSON.parse(content);
    if (argumentos instanceof Array) {
      if (argumentos.length == 1) {
        this.context.setListenMode(argumentos[0] === true);
      } else if (argumentos.length >= 2) {
        this.context.setListenMode(
          argumentos[0] === true,
          argumentos[1] === true
        );
      }
    }
  }
}
