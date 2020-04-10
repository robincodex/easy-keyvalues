import * as fs from 'fs';
import * as readline from 'readline';
import * as stream from 'stream';

enum KeyValuesType {
    Comment,
    EndOfLineComment,
    KeyValue,
    BaseStatement,
}

/**
 * When the key is "//", it's a comment.  
 * When the key is "#base", it's a base statement. Example: #base "file path"
 */
type KeyValues = {
    Type: KeyValuesType,
    Key?: string,
    Value?: string | KeyValues[],
};

/**
 * Read from KeyValues file
 * @param path A file path of KeyValues
 * @param encoding Default utf8
 */
export async function readFromFile(path: string, encoding = 'utf8'): Promise<KeyValues[]>  {
    const s = fs.createReadStream(path, {encoding});
    return await keyValuesParser(s);
}

/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
export async function readFromString(content: string): Promise<KeyValues[]>  {
    const s = stream.Readable.from(content);
    return await keyValuesParser(s);
}

async function keyValuesParser(s: NodeJS.ReadableStream): Promise<KeyValues[]> {
    const rl = readline.createInterface({
        input: s,
        crlfDelay: Infinity,
    });

    let n = 0;
    let leftMark = false;
    let breaceCount = 0;
    let str = '';
    let kv: KeyValues = null;
    let result: KeyValues[] = [];
    let resultQueue: KeyValues[][] = [];
    let kvQueue: KeyValues[] = [];
    for await (const line of rl) {
        n++;
        let isEndOfLineComment = false;

        for(let i=0; i<line.length; i++) {
            let c = line[i];

            // If leftMark is true then merge char to str
            if (leftMark) {
                if (i === 0) {
                    str += '\n';
                }
                if (c === '\\') {
                    i++;
                    continue;
                }
                if (c === '"') {
                    if(!kv.Key) {
                        kv.Key = str;
                    } else {
                        kv.Value = str;
                        kv = null;
                    }
                    leftMark = false;
                    str = '';
                    continue;
                }
                str += c;
                continue;
            }

            // If comment
            if (c === '/') {
                if (line[i+1] !== '/') {
                    throw new Error(`Comment error in line ${n}`);
                }
                let comment: KeyValues = null;
                if (isEndOfLineComment) {
                    comment = { Type: KeyValuesType.EndOfLineComment };
                } else {
                    if (kv !== null && kv.Type === KeyValuesType.KeyValue && !kv.Value) {
                        comment = { Type: KeyValuesType.EndOfLineComment };
                    } else {
                        comment = { Type: KeyValuesType.Comment };
                    }
                }
                comment.Value = line.substring(i + 2);
                result.push(comment);
                break;
            }

            // If base statement
            if (c === '#') {
                if(line.substr(i+1, 4) === 'base') {
                    i += 4;
                    isEndOfLineComment = true;
                    kv = {
                        Type: KeyValuesType.BaseStatement,
                        Key: "#base",
                    };
                    result.push(kv);
                    continue;
                }
                throw Error(`Invalid format in line ${n}`);
            }

            // If start merge string
            if (c === '"') {
                leftMark = true;
                str = '';
                isEndOfLineComment = true;
                if(kv === null) {
                    kv = {
                        Type: KeyValuesType.KeyValue,
                    };
                    result.push(kv);
                }
                continue;
            }

            // If open breace
            if (c === '{') {
                if (kv === null || kv.Type !== KeyValuesType.KeyValue) {
                    throw new Error(`Format error in line ${n}, col ${i} : ${c}`);
                }
                breaceCount++;
                isEndOfLineComment = true;
                kvQueue.push(kv);
                resultQueue.push(result);
                result = [];
                kv = null;
                continue;
            }
            // If close breace
            if (c === '}') {
                if (kv !== null) {
                    throw new Error(`Format error in line ${n}, col ${i} : ${c}`);
                }
                kv = kvQueue.pop();
                kv.Value = result;
                result = resultQueue.pop();
                kv = null;
                breaceCount++;
                continue;
            }

            // If space
            if (c === ' ' || c === '\t') {
                continue;
            }

            throw new Error(`Read error in line ${n}, col ${i} : ${c}`);
        }
    }

    if (breaceCount%2 !== 0) {
        throw new Error(`The braces are not equal`);
    }

    return result;
}

/**
 * Format KeyValues object to string
 * @param kvList KeyValues list
 * @param tab spaces
 */
export function FormatKeyValues(kvList: KeyValues[], tab = ''): string {
    let text = '';

    for(let [i, kv] of kvList.entries()) {
        if (kv.Type === KeyValuesType.Comment) {
            text += `${tab}//${kv.Value}\n`;
        }
        else if (kv.Type === KeyValuesType.BaseStatement) {
            let nextKV = kvList[i+1];
            let endOfLineComment = '';
            if (nextKV && nextKV.Type === KeyValuesType.EndOfLineComment) {
                endOfLineComment = " //" + nextKV.Value as string;
            }
            text += `${tab}"#base"        "${kv.Value}"${endOfLineComment}\n`;
        }
        else if (kv.Type === KeyValuesType.KeyValue) {
            let nextKV = kvList[i+1];
            let endOfLineComment = '';
            if (nextKV && nextKV.Type === KeyValuesType.EndOfLineComment) {
                endOfLineComment = " //" + nextKV.Value as string;
            }

            if (Array.isArray(kv.Value)) {
                text += `${tab}"${kv.Key}"${endOfLineComment}\n${tab}{\n`;
                text += FormatKeyValues(kv.Value, tab + '    ');
                text += `${tab}}\n`;
            }
            else {
                text += `${tab}"${kv.Key}"        "${kv.Value}"${endOfLineComment}\n`;
            }
        }
    }

    return text;
}