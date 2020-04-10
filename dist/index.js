"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const readline = require("readline");
const stream = require("stream");
var KeyValuesType;
(function (KeyValuesType) {
    KeyValuesType[KeyValuesType["Comment"] = 0] = "Comment";
    KeyValuesType[KeyValuesType["EndOfLineComment"] = 1] = "EndOfLineComment";
    KeyValuesType[KeyValuesType["KeyValue"] = 2] = "KeyValue";
    KeyValuesType[KeyValuesType["BaseStatement"] = 3] = "BaseStatement";
})(KeyValuesType = exports.KeyValuesType || (exports.KeyValuesType = {}));
/**
 * Read from KeyValues file
 * @param path A file path of KeyValues
 * @param encoding Default utf8
 */
async function readFromFile(path, encoding = 'utf8') {
    const s = fs.createReadStream(path, { encoding });
    return await keyValuesParser(s);
}
exports.readFromFile = readFromFile;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
async function readFromString(content) {
    const s = stream.Readable.from(content);
    return await keyValuesParser(s);
}
exports.readFromString = readFromString;
async function keyValuesParser(s) {
    var e_1, _a;
    const rl = readline.createInterface({
        input: s,
        crlfDelay: Infinity,
    });
    let n = 0;
    let leftMark = false;
    let breaceCount = 0;
    let str = '';
    let kv = null;
    let result = [];
    let resultQueue = [];
    let kvQueue = [];
    try {
        for (var rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = await rl_1.next(), !rl_1_1.done;) {
            const line = rl_1_1.value;
            n++;
            let isEndOfLineComment = false;
            for (let i = 0; i < line.length; i++) {
                let c = line[i];
                // If leftMark is true then merge char to str
                if (leftMark) {
                    if (i === 0) {
                        str += '\n';
                    }
                    if (c === '\\') {
                        i++;
                        str += c + line[i];
                        continue;
                    }
                    if (c === '"') {
                        if (!kv.Key) {
                            kv.Key = str;
                        }
                        else {
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
                    if (line[i + 1] !== '/') {
                        throw new Error(`Comment error in line ${n}`);
                    }
                    let comment = null;
                    if (isEndOfLineComment) {
                        comment = { Type: KeyValuesType.EndOfLineComment };
                    }
                    else {
                        if (kv !== null && kv.Type === KeyValuesType.KeyValue && !kv.Value) {
                            comment = { Type: KeyValuesType.EndOfLineComment };
                        }
                        else {
                            comment = { Type: KeyValuesType.Comment };
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
                    if (kv === null) {
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
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (rl_1_1 && !rl_1_1.done && (_a = rl_1.return)) await _a.call(rl_1);
        }
        finally { if (e_1) throw e_1.error; }
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
//# sourceMappingURL=index.js.map