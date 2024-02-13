import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandPopUpOpen extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumento = JSON.parse(content);
    //console.log(`popupopen ${content}`);
    const response = await this.context.popUpOpen(argumento);
    // console.log(JSON.stringify(response));
    this.context.emit('popupchoice', JSON.stringify(response));
  }
}
