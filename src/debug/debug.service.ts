import path from 'node:path';
import { writeFile } from 'fs/promises';

import { isLocal } from '../../env.ts';

export class DebugService {
  /**
   * @param data
   * @param fileName
   * @private
   */
  public static async writeDataForDebug(data: object | string, fileName: string) {
    if (!isLocal) {
      return;
    }

    try {
      const filePath = path.join('src/debug', fileName);
      const writeValue = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await writeFile(filePath, writeValue, { encoding: 'utf8' });
      console.log('Wrote ' + filePath);
    } catch (err) {
      console.error(err);
    }
  }
}
