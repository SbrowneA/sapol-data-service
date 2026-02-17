import {readFile} from "fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {type StreetTypeDbInsert} from "../../schemas/db/street-type.schema.ts";

export class DataNormalisationService {
  public static async getStreetTypesFromFile(): Promise<StreetTypeDbInsert[]> {
    // read csv for street types
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../testing', 'street-types.csv');

    const file = await readFile(filePath, 'utf8');
    const lines = file.split(/\r?\n/); // handle unix (\n) or windows (\r\n)
    lines.shift(); // remove header line
    const fields = {
      street_type_key: 'street_type_key',
      canonical_key: 'canonical_key',
      key_type: 'key_type'
    };
    const streetTypes: StreetTypeDbInsert[] = [];

    lines.forEach((line) => {
      const values = line.split(',');

      if (values.length > 1) {
        const streetType: any = {};
        streetType[fields.street_type_key ?? ''] = values[0];
        streetType[fields.canonical_key ?? ''] = values[1];
        streetType[fields.key_type ?? ''] = values[2];
        streetTypes.push(streetType);
      }
    });
    return streetTypes;
  }
}