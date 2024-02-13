import { Buffer } from 'buffer';
import { LocalFileService } from 'src/services/localfile.service';
import { MyDates } from 'srcJs/MyDates';
import sortify from 'srcJs/sortify';
import { HasFiles } from '../dataaccess/HasFiles';
import { GraphManager } from '../models/GraphManager';

export abstract class CommandContext extends GraphManager implements HasFiles {
  static MAX_MESSAGE_LENGTH = 500;
  IMAGES_ROOT = 'assets/word-game/';
  SOUNDS_ROOT = 'assets/police/sounds';
  messages: Array<String> = [];
  listenMode = {
    preview: true,
    complete: true,
  };
  localFileService: LocalFileService;

  constructor(localFileService: LocalFileService) {
    super();
    this.localFileService = localFileService;
  }

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

  async readFile(path: string): Promise<string> {
    const response = await this.localFileService.readPlainText(path);
    return response;
  }

  async writeFile(path: string, content: any) {
    return await this.localFileService.save({
      base64: Buffer.from(JSON.stringify(content, null, 4), 'utf8').toString(
        'base64'
      ),
      fileName: path,
    });
  }
}

export abstract class CommandGeneric {
  context: CommandContext;
  constructor(context: CommandContext) {
    this.context = context;
  }
  abstract execute(content: string): Promise<void>;
}
