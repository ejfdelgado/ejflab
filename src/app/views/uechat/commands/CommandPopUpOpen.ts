import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandPopUpOpen extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumento = JSON.parse(content);
    //console.log(`popupopen ${content}`);
    const { ref, promise } = this.context.popUpOpen(argumento);

    this.context.registerPopUp(argumento.callback, ref);
    //console.log(CommandPopUpOpen.popupsMap);
    const response = await promise;
    //console.log(JSON.stringify(response));
    this.context.emit('popupchoice', JSON.stringify(response));
  }
}
