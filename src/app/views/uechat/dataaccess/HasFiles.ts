import { FileSaveResponseData } from 'src/services/fileInterface';
import { LocalFileService } from 'src/services/localfile.service';

export interface HasFiles {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: any): Promise<FileSaveResponseData>;
}
