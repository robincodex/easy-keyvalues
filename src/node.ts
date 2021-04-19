import { readFileSync, writeFileSync, promises } from 'fs';
import { join } from 'path';
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

/**
 * Return all #base KeyValues
 * @param rootNode The KeyValues of root node
 * @param rootDir root dir
 */
export async function AutoLoadKeyValuesBase(
    rootNode: KeyValues,
    rootDir: string
): Promise<KeyValues[]> {
    const result = rootNode.FindAllKeys('#base');
    for (const kv of result) {
        const filePath = join(rootDir, kv.GetValue());
        const children = await LoadKeyValues(filePath, 'utf8');
        kv.LoadBase(
            filePath,
            children.GetChildren().map((v) => v.Free())
        );
    }
    return result;
}

/**
 * Return all #base KeyValues
 * @param rootNode The KeyValues of root node
 * @param rootDir root dir
 */
export function AutoLoadKeyValuesBaseSync(rootNode: KeyValues, rootDir: string): KeyValues[] {
    const result = rootNode.FindAllKeys('#base');
    for (const kv of result) {
        const filePath = join(rootDir, kv.GetValue());
        const children = LoadKeyValuesSync(filePath, 'utf8');
        kv.LoadBase(
            filePath,
            children.GetChildren().map((v) => v.Free())
        );
    }
    return result;
}

export async function SaveKeyValues(
    file: string,
    kv: KeyValues,
    encoding: BufferEncoding = 'utf8'
) {
    await writeFile(file, kv.Format(), encoding);

    // Save #base
    const bases = kv.FindAllKeys('#base');
    for (const b of bases) {
        if (b.GetBaseFilePath() && b.GetBaseAbsoluteFilePath()) {
            const root = KeyValues.CreateRoot();
            root.SetValue(b.GetChildren().map((v) => v));
            await writeFile(b.GetBaseAbsoluteFilePath(), root.Format(), encoding);
        }
    }
}

export async function SaveKeyValuesSync(
    file: string,
    kv: KeyValues,
    encoding: BufferEncoding = 'utf8'
) {
    writeFileSync(file, kv.Format(), encoding);

    // Save #base
    const bases = kv.FindAllKeys('#base');
    for (const b of bases) {
        if (b.GetBaseFilePath() && b.GetBaseAbsoluteFilePath()) {
            const root = KeyValues.CreateRoot();
            root.SetValue(b.GetChildren().map((v) => v));
            writeFileSync(b.GetBaseAbsoluteFilePath(), root.Format(), encoding);
        }
    }
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
