import { readFile } from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type StreetTypeDbInsert, StreetTypeInsertSchemaDb } from '../../schemas/db/street-type.schema.ts';

export class DataNormalisationService {
  public static async getStreetTypesFromFile(): Promise<StreetTypeDbInsert[]> {
    // read csv for street types
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../testing', 'street-types.csv');

    const file = await readFile(filePath, 'utf8');
    const lines = file.split(/\r?\n/); // handle unix (\n) or windows (\r\n)
    lines.shift(); // remove header line
    const streetTypes: StreetTypeDbInsert[] = [];

    lines.forEach((line: string) => {
      const values: string[] = line.split(',');

      if (values.length > 1) {
        const streetType: Record<string, string | undefined> = {};
        streetType['street_type_key'] = values[0];
        streetType['canonical_key'] = values[1];
        streetType['key_type'] = values[2];
        if (StreetTypeInsertSchemaDb.safeParse(streetType)) {
          streetTypes.push(streetType as StreetTypeDbInsert);
        }
      }
    });
    return streetTypes;
  }
}
