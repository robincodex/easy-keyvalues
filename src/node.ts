import { promises } from 'fs';
import { resolve } from 'path';
import { KeyValues3Comments, KeyValuesComments } from './Comments';
import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';
import { setKeyValuesAdapter } from './adapter';

const { readFile, writeFile } = promises;

export * from './adapter';

export { KeyValues, KeyValues3, KeyValues3Comments, KeyValuesComments };

setKeyValuesAdapter({
    async readFile(path, encoding = 'utf8') {
        const buf = await readFile(path, encoding as BufferEncoding);
        return buf.toString();
    },
    async writeFile(path, data, encoding = 'utf8') {
        await writeFile(path, data, encoding as BufferEncoding);
    },
    resolvePath(filename, basePath) {
        return resolve(filename, '../' + basePath);
    },
    createKeyValuesID() {
        return '';
    },
});
