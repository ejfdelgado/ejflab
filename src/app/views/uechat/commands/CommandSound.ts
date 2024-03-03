import { ModuloSonido } from 'srcJs/ModuloSonido';
import { MyConstants } from 'srcJs/MyConstants';
import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandSound extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumento = JSON.parse(content);
    if (typeof argumento == 'string') {
      ModuloSonido.play(
        `${MyConstants.SRV_ROOT}${this.context.SOUNDS_ROOT}/${argumento}`
      );
    } else if (argumento instanceof Array) {
      let volume = 1;
      if (argumento.length >= 5) {
        volume = parseFloat(argumento[4]);
        if (isNaN(volume)) {
          volume = 1;
        } else {
          volume = volume / 100;
        }
      }
      ModuloSonido.play(
        `${MyConstants.SRV_ROOT}${this.context.SOUNDS_ROOT}/${argumento[0]}`,
        argumento[1] == 'loop',
        volume
      );
    }
  }
}
