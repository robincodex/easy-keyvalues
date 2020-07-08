"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatKeyValues = exports.loadFromString = exports.NewKeyValues = exports.emptyKeyValues = exports.KeyValuesType = void 0;
var KeyValuesType;
(function (KeyValuesType) {
    KeyValuesType[KeyValuesType["Comment"] = 0] = "Comment";
    KeyValuesType[KeyValuesType["EndOfLineComment"] = 1] = "EndOfLineComment";
    KeyValuesType[KeyValuesType["KeyValue"] = 2] = "KeyValue";
    KeyValuesType[KeyValuesType["BaseStatement"] = 3] = "BaseStatement";
})(KeyValuesType = exports.KeyValuesType || (exports.KeyValuesType = {}));
exports.emptyKeyValues = { Type: KeyValuesType.KeyValue, Key: '', Value: '' };
function NewKeyValues(Key, Value) {
    return { Type: KeyValuesType.KeyValue, Key, Value };
}
exports.NewKeyValues = NewKeyValues;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
function loadFromString(content) {
    return keyValuesParser(content);
}
exports.loadFromString = loadFromString;
function keyValuesParser(content) {
    let n = 0;
    let leftMark = false;
    let isSpecialMark = false;
    let breaceCount = 0;
    let str = '';
    let kv = null;
    let result = [];
    let resultQueue = [];
    let kvQueue = [];
    content = content.replace(/\r\n/g, '\n');
    const lines = content.split('\n');
    for (const line of lines) {
        n++;
        let isEndOfLineComment = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            const isSpace = c === ' ' || c === '\t' || c === '\r' || c === '\n';
            // If leftMark is true then merge char to str
            if (leftMark) {
                if (isSpecialMark) {
                    if (c === '{' || c === '\"' || c === '[' || c === ']') {
                        throw new Error(`Not readable in line ${n}`);
                    }
                    if (isSpace || c === '}') {
                        if (kv.Key === null) {
                            kv.Key = str;
                        }
                        else {
                            kv.Value = str;
                            kv = null;
                        }
                        leftMark = false;
                        isSpecialMark = false;
                        str = '';
                        if (c === '}') {
                            i--;
                        }
                        continue;
                    }
                    str += c;
                    continue;
                }
                if (i === 0) {
                    str += '\n';
                }
                if (c === '\\') {
                    i++;
                    str += c + line[i];
                    continue;
                }
                if (c === '"') {
                    if (kv.Key === null) {
                        kv.Key = str;
                    }
                    else {
                        kv.Value = str;
                        kv = null;
                    }
                    leftMark = false;
                    isSpecialMark = false;
                    str = '';
                    continue;
                }
                str += c;
                continue;
            }
            // If comment
            if (c === '/') {
                if (line[i + 1] !== '/') {
                    throw new Error(`Comment error in line ${n}`);
                }
                let comment = null;
                if (isEndOfLineComment) {
                    comment = {
                        Type: KeyValuesType.EndOfLineComment,
                        Key: '',
                        Value: null,
                    };
                }
                else {
                    if (kv !== null && kv.Type === KeyValuesType.KeyValue && !kv.Value) {
                        comment = {
                            Type: KeyValuesType.EndOfLineComment,
                            Key: '',
                            Value: null,
                        };
                    }
                    else {
                        comment = {
                            Type: KeyValuesType.Comment,
                            Key: '',
                            Value: null,
                        };
                    }
                }
                comment.Value = line.substring(i + 2);
                result.push(comment);
                break;
            }
            // If base statement
            if (c === '#') {
                if (line.substr(i + 1, 4) === 'base') {
                    i += 4;
                    isEndOfLineComment = true;
                    kv = {
                        Type: KeyValuesType.BaseStatement,
                        Key: "#base",
                        Value: null,
                    };
                    result.push(kv);
                    continue;
                }
                throw Error(`Invalid format in line ${n}`);
            }
            // If start merge string
            if (c === '"') {
                leftMark = true;
                isSpecialMark = false;
                str = '';
                isEndOfLineComment = true;
                if (kv === null) {
                    kv = {
                        Type: KeyValuesType.KeyValue,
                        Key: null,
                        Value: null,
                    };
                    result.push(kv);
                }
                continue;
            }
            // If open breace
            if (c === '{') {
                if (kv === null || kv.Type !== KeyValuesType.KeyValue) {
                    throw new Error(`Not readable in line ${n}, col ${i} : ${c}`);
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
                    throw new Error(`Not readable in line ${n}, col ${i} : ${c}`);
                }
                kv = kvQueue.pop();
                kv.Value = result;
                result = resultQueue.pop();
                kv = null;
                breaceCount++;
                continue;
            }
            // If space
            if (isSpace) {
                continue;
            }
            leftMark = true;
            isSpecialMark = true;
            str = c;
            isEndOfLineComment = true;
            if (kv === null) {
                kv = {
                    Type: KeyValuesType.KeyValue,
                    Key: null,
                    Value: null,
                };
                result.push(kv);
            }
        }
    }
    if (breaceCount % 2 !== 0) {
        throw new Error(`The braces are not equal`);
    }
    return result;
}
/**
 * Format KeyValues object to string
 * @param kvList KeyValues list
 * @param tab spaces
 */
function formatKeyValues(kvList, tab = '') {
    let text = '';
    for (let [i, kv] of kvList.entries()) {
        if (kv.Type === KeyValuesType.Comment) {
            text += `${tab}//${kv.Value}\n`;
        }
        else if (kv.Type === KeyValuesType.BaseStatement) {
            let nextKV = kvList[i + 1];
            let endOfLineComment = '';
            if (nextKV && nextKV.Type === KeyValuesType.EndOfLineComment) {
                endOfLineComment = " //" + nextKV.Value;
            }
            text += `${tab}"#base"        "${kv.Value}"${endOfLineComment}\n`;
        }
        else if (kv.Type === KeyValuesType.KeyValue) {
            let nextKV = kvList[i + 1];
            let endOfLineComment = '';
            if (nextKV && nextKV.Type === KeyValuesType.EndOfLineComment) {
                endOfLineComment = " //" + nextKV.Value;
            }
            if (Array.isArray(kv.Value)) {
                text += `${tab}"${kv.Key}"${endOfLineComment}\n${tab}{\n`;
                text += formatKeyValues(kv.Value, tab + '    ');
                text += `${tab}}\n`;
            }
            else {
                text += `${tab}"${kv.Key}"        "${kv.Value}"${endOfLineComment}\n`;
            }
        }
    }
    return text;
}
exports.formatKeyValues = formatKeyValues;
exports.default = {
    loadFromString,
    formatKeyValues,
    KeyValuesType,
};
//# sourceMappingURL=index.js.map