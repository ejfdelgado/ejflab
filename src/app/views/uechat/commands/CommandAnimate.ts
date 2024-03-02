import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandAnimate extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    console.log(`animate ${JSON.stringify(content)}`);
  }
}
