import { ModuloSonido } from 'srcJs/ModuloSonido';
import { MyConstants } from 'srcJs/MyConstants';
import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandMute extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumento = JSON.parse(content);
    if (typeof argumento == 'string') {
      ModuloSonido.stop(
        `${MyConstants.SRV_ROOT}${this.context.SOUNDS_ROOT}/${argumento}`
      );
    } else if (argumento instanceof Array) {
      ModuloSonido.stop(
        `${MyConstants.SRV_ROOT}${this.context.SOUNDS_ROOT}/${argumento[0]}`
      );
    }
  }
}
