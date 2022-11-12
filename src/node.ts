import { readFileSync, writeFileSync, promises } from 'fs';
import { join, resolve } from 'path';
import KeyValues from './KeyValues';
import KeyValues3 from './KeyValues3';
import { KeyValuesComments, KeyValues3Comments } from './Comments';
import { setKeyValuesAdapter } from './adapter';
import * as iconv from 'iconv-lite';
import chardet from 'chardet';

const { readFile, writeFile } = promises;

export * from './adapter';

export { KeyValues, KeyValues3, KeyValuesComments, KeyValues3Comments };

const fileEncoding: Record<string, string> = {};

setKeyValuesAdapter({
    async readFile(path) {
        const buf = await readFile(path);
        const encoding = chardet.detect(buf);
        if (!encoding) {
            throw new Error('Unable to detect encoding from ' + path);
        }
        fileEncoding[path] = encoding;
        const result = iconv.decode(buf, encoding);
        return result.toString();
    },
    async writeFile(path, data) {
        const result = iconv.encode(data, fileEncoding[path] || 'utf8');
        await writeFile(path, result);
    },
    resolvePath(filename, basePath) {
        return resolve(filename, '../' + basePath);
    },
    createKeyValuesID() {
        return '';
    },
});
