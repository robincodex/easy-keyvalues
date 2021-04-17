import { readFile, writeFile } from 'fs/promises';
import { readFileSync, writeFileSync } from 'fs';
import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';

export { KeyValues, KeyValues3 };

export async function LoadKeyValues(file: string, encoding: BufferEncoding = 'utf8') {
    const body = await readFile(file, encoding);
    return KeyValues.Parse(body);
}

export function LoadKeyValuesSync(file: string, encoding: BufferEncoding = 'utf8') {
    const body = readFileSync(file, encoding);
    return KeyValues.Parse(body);
}

export async function SaveKeyValues(
    file: string,
    kv: KeyValues,
    encoding: BufferEncoding = 'utf8'
) {
    await writeFile(file, kv.Format(), encoding);
}

export async function SaveKeyValuesSync(
    file: string,
    kv: KeyValues,
    encoding: BufferEncoding = 'utf8'
) {
    writeFileSync(file, kv.Format(), encoding);
}
