import { readFileSync, writeFileSync, promises } from 'fs';
import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';

const { readFile, writeFile } = promises;

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

export async function LoadKeyValues3(file: string, encoding: BufferEncoding = 'utf8') {
    const body = await readFile(file, encoding);
    return KeyValues3.Parse(body);
}

export function LoadKeyValues3Sync(file: string, encoding: BufferEncoding = 'utf8') {
    const body = readFileSync(file, encoding);
    return KeyValues3.Parse(body);
}

export async function SaveKeyValues3(
    file: string,
    kv: KeyValues3,
    encoding: BufferEncoding = 'utf8'
) {
    await writeFile(file, kv.Format(), encoding);
}

export async function SaveKeyValues3Sync(
    file: string,
    kv: KeyValues3,
    encoding: BufferEncoding = 'utf8'
) {
    writeFileSync(file, kv.Format(), encoding);
}
