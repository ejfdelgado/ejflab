import { Buffer } from 'buffer';
import { LocalFileService } from 'src/services/localfile.service';
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

  async deleteLocalFile(path: string) {
    await this.localFileService.delete(path);
  }
}

export abstract class CommandGeneric {
  context: CommandContext;
  constructor(context: CommandContext) {
    this.context = context;
  }
  abstract execute(content: string): Promise<void>;
}
