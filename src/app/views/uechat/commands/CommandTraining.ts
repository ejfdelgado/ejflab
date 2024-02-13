import { CommandContext, CommandGeneric } from './CommandGeneric';

export class CommandTraining extends CommandGeneric {
  constructor(context: CommandContext) {
    super(context);
  }

  async execute(content: string): Promise<void> {
    const argumentos = JSON.parse(content);
    // ["train","left_hand","1"]
    // ["capture","hand_hand","0"]
    const action = argumentos[0];
    const bodyPart = argumentos[1];
    const targetModel = argumentos[2];
    const filePath = `targets/${bodyPart}_${targetModel}.json`;
    if (action == 'capture') {
      // Read model bodyPart
      const model = {
        t: new Date().getTime(),
        bodyPart,
        targetModel,
        pose: [],
      };
      //and store in targetModel file
      const response = await this.context.writeFile(filePath, model);
      /*
      const uri = response.uri;
      SimpleObj.recreate(
        this.modelDocument,
        `targets.${bodyPart}.model_${targetModel}`,
        { uri },
        true
      );
      this.saveDocument();
      */
    } else if (action == 'train') {
      // Loads model from bodyPart
      const model = await this.context.readFile(filePath);
      console.log(JSON.stringify(model));
    }
  }
}
