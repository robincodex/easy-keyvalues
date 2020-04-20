"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const buffer_1 = require("buffer");
var KeyValues3Type;
(function (KeyValues3Type) {
    KeyValues3Type[KeyValues3Type["Comment"] = 0] = "Comment";
    KeyValues3Type[KeyValues3Type["MultiLineComment"] = 1] = "MultiLineComment";
    KeyValues3Type[KeyValues3Type["KeyValue_Boolean"] = 2] = "KeyValue_Boolean";
    KeyValues3Type[KeyValues3Type["KeyValue_Int"] = 3] = "KeyValue_Int";
    KeyValues3Type[KeyValues3Type["KeyValue_Double"] = 4] = "KeyValue_Double";
    KeyValues3Type[KeyValues3Type["KeyValue_String"] = 5] = "KeyValue_String";
    KeyValues3Type[KeyValues3Type["KeyValue_MultiLineString"] = 6] = "KeyValue_MultiLineString";
    KeyValues3Type[KeyValues3Type["KeyValue_Resource"] = 7] = "KeyValue_Resource";
    KeyValues3Type[KeyValues3Type["KeyValue_Deferred_Resource"] = 8] = "KeyValue_Deferred_Resource";
    KeyValues3Type[KeyValues3Type["KeyValue_Array"] = 9] = "KeyValue_Array";
    KeyValues3Type[KeyValues3Type["KeyValue_Object"] = 10] = "KeyValue_Object";
    KeyValues3Type[KeyValues3Type["Header"] = 11] = "Header";
})(KeyValues3Type = exports.KeyValues3Type || (exports.KeyValues3Type = {}));
/**
 * Read from KeyValues file
 * @param path A file path of KeyValues
 * @param encoding Default utf8
 */
async function readFromFile(path, encoding = 'utf8') {
    const s = await fs.promises.readFile(path, { encoding });
    const ctx = {
        content: buffer_1.Buffer.from(s),
        index: 0,
        line: 1,
        column: 0,
    };
    return await _keyValues3Parser(ctx);
}
exports.readFromFile = readFromFile;
/**
 * Read from KeyValues format
 * @param content A string of KeyValues format
 */
async function readFromString(content) {
    const ctx = {
        content: buffer_1.Buffer.from(content, 'utf8'),
        index: 0,
        line: 1,
        column: 0,
    };
    return await _keyValues3Parser(ctx);
}
exports.readFromString = readFromString;
function formatKeyValues(root, tab = '', isParentArray = false) {
    let text = '';
    for (const kv of root) {
        switch (kv.Type) {
            case KeyValues3Type.Header:
                text += kv.Value + "\n";
                break;
            case KeyValues3Type.KeyValue_Object:
                if (Array.isArray(kv.Value)) {
                    if (isParentArray) {
                        text += `${tab}{\n`;
                        text += formatKeyValues(kv.Value, tab + "    ");
                        text += `${tab}},\n`;
                        break;
                    }
                    if (kv.Key) {
                        text += `${tab}${kv.Key} = \n${tab}{\n`;
                    }
                    else {
                        text += `${tab}{\n`;
                    }
                    text += formatKeyValues(kv.Value, tab + "    ");
                    text += `${tab}}\n`;
                }
                break;
            case KeyValues3Type.KeyValue_Array:
                if (Array.isArray(kv.Value)) {
                    if (isParentArray) {
                        text += `${tab}[\n`;
                        text += formatKeyValues(kv.Value, tab + "    ", true);
                        text += `${tab}],\n`;
                        break;
                    }
                    text += `${tab}${kv.Key} = \n${tab}[\n`;
                    text += formatKeyValues(kv.Value, tab + "    ", true);
                    text += `${tab}]\n`;
                }
                break;
            case KeyValues3Type.KeyValue_Boolean:
            case KeyValues3Type.KeyValue_Int:
            case KeyValues3Type.KeyValue_Double:
            case KeyValues3Type.KeyValue_String:
            case KeyValues3Type.KeyValue_MultiLineString:
            case KeyValues3Type.KeyValue_Resource:
            case KeyValues3Type.KeyValue_Deferred_Resource:
                if (isParentArray) {
                    text += `${tab}${kv.Value},\n`;
                    break;
                }
                text += `${tab}${kv.Key} = ${kv.Value}\n`;
                break;
            case KeyValues3Type.Comment:
                text += `${tab}//${kv.Value}\n`;
                break;
            case KeyValues3Type.MultiLineComment:
                text += `${tab}\/*${kv.Value}*\/\n`;
                break;
        }
    }
    return text;
}
exports.formatKeyValues = formatKeyValues;
var ParserState;
(function (ParserState) {
    ParserState[ParserState["None"] = 0] = "None";
    ParserState[ParserState["Key"] = 1] = "Key";
    ParserState[ParserState["Value"] = 2] = "Value";
    ParserState[ParserState["String"] = 3] = "String";
    ParserState[ParserState["MultiLineString"] = 4] = "MultiLineString";
    ParserState[ParserState["Comment"] = 5] = "Comment";
    ParserState[ParserState["MultiLineComment"] = 6] = "MultiLineComment";
})(ParserState || (ParserState = {}));
const LR = 10; // \n
const CR = 13; // \r
const SPACE = 32; // SPACE
const HT = 9; // \t
const LeftBrace = 123; // {
const RightBrace = 125; // }
const LeftBracket = 91; // [
const RightBracket = 93; // ]
const COMMA = 44; // ,
const EQUAL = 61; // =
async function _keyValues3Parser(ctx, isArray = false) {
    let result = [];
    let state = ParserState.None;
    let str = '';
    let checkKey = false;
    let kv = null;
    for (; ctx.index < ctx.content.length; ctx.index++, ctx.column++) {
        const code = ctx.content[ctx.index];
        const isSpace = code === SPACE || code === HT;
        const c = String.fromCharCode(code);
        // console.log(c, code);
        if (code === HT) {
            ctx.column += 3;
        }
        if (code === CR) {
            continue;
        }
        if (code === LR) {
            // Header
            if (ctx.line === 1) {
                if (!str.startsWith("<!--") && !str.endsWith("-->")) {
                    throw new Error("The KeyValues3 header is wrong");
                }
                kv = {
                    Type: KeyValues3Type.KeyValue_String,
                    Key: '',
                    Value: '',
                };
                result.push({
                    Type: KeyValues3Type.Header,
                    Key: '',
                    Value: str,
                });
                str = '';
                state = ParserState.Value;
                ctx.line++;
                ctx.column = 0;
                continue;
            }
            ctx.line++;
            ctx.column = 0;
        }
        // Single-line comment
        if (state === ParserState.Comment) {
            if (c === "/") {
                kv = {
                    Type: KeyValues3Type.Comment,
                    Key: '',
                    Value: '',
                };
            }
            else if (c === "*") {
                state = ParserState.MultiLineComment;
                kv = {
                    Type: KeyValues3Type.Comment,
                    Key: '',
                    Value: '',
                };
                str = '';
                continue;
            }
            else if (kv) {
                if (code === LR) {
                    state = ParserState.None;
                    result.push(kv);
                    kv = null;
                    str = '';
                    continue;
                }
                kv.Value += c;
                continue;
            }
            else {
                throw new Error(`Invalid comment in line ${ctx.line}`);
            }
        }
        // Multi-line comment
        if (state === ParserState.MultiLineComment) {
            if (str.length >= 4 && str.endsWith('*/')) {
                kv.Type = KeyValues3Type.MultiLineComment;
                kv.Value = str.substring(0, str.length - 2);
                state = ParserState.None;
                result.push(kv);
                kv = null;
                str = '';
                continue;
            }
            str += c;
            continue;
        }
        // String value
        if (state === ParserState.String) {
            if (str.length >= 2 && str.startsWith('\"\"')) {
                if (c === '\"') {
                    state = ParserState.MultiLineString;
                    str += c;
                    continue;
                }
                else if (isSpace || code === LR || c === "/") {
                    state = ParserState.None;
                    kv.Type = KeyValues3Type.KeyValue_String;
                    kv.Value = '';
                    str = '';
                    result.push(kv);
                    kv = null;
                    if (c === "/") {
                        ctx.index--;
                    }
                    continue;
                }
                else {
                    throw new Error(`Invalid string value in line ${ctx.line}.`);
                }
            }
            else if (str.length >= 2 && c === '\"' && str[str.length - 1] !== '\\') {
                str += c;
                state = ParserState.None;
                if (str.startsWith("resource:")) {
                    kv.Type = KeyValues3Type.KeyValue_Resource;
                }
                else if (str.startsWith("deferred_resource:")) {
                    kv.Type = KeyValues3Type.KeyValue_Deferred_Resource;
                }
                else {
                    kv.Type = KeyValues3Type.KeyValue_String;
                }
                kv.Value = str;
                result.push(kv);
                str = '';
                kv = null;
                continue;
            }
            str += c;
            continue;
        }
        // Multi-line string value
        if (state === ParserState.MultiLineString) {
            if (str.length >= 6 && ctx.column === 3 && c === '\"') {
                str += c;
                if (str.endsWith('\"\"\"')) {
                    kv.Value = str;
                    kv.Type = KeyValues3Type.KeyValue_MultiLineString;
                    result.push(kv);
                    kv = null;
                    state = ParserState.None;
                    str = '';
                }
                else {
                    throw new Error(`Invalid multi-line string ending in line ${ctx.line}, the """ require at the beginning of line`);
                }
                continue;
            }
            str += c;
            continue;
        }
        // Header
        if (ctx.line === 1) {
            str += c;
            continue;
        }
        // 
        if (state === ParserState.None) {
            if (isSpace || code === LR) {
                continue;
            }
            // If } or ]
            if (code === RightBrace || code === RightBracket) {
                break;
            }
            if (c === "/") {
                state = ParserState.Comment;
                continue;
            }
            if (isArray) {
                if (c === '=') {
                    throw new Error(`Not readable in line ${ctx.line}, col ${ctx.column} : ${c}`);
                }
                if (code === COMMA) {
                    continue;
                }
                state = ParserState.Value;
                kv = {
                    Type: KeyValues3Type.KeyValue_String,
                    Key: '',
                    Value: '',
                };
                str = '';
            }
            else {
                if (code === COMMA) {
                    throw new Error(`Not readable in line ${ctx.line}, col ${ctx.column} : ${c}`);
                }
                if (code === EQUAL) {
                    state = ParserState.Value;
                    continue;
                }
                state = ParserState.Key;
                checkKey = c !== "\"";
                str += c;
                continue;
            }
        }
        if (state === ParserState.Key) {
            // start create key
            if (checkKey) {
                if (isSpace || code === LR || code === EQUAL) {
                    const numCode = str.charCodeAt(0);
                    if (numCode <= 57 && numCode >= 48) {
                        throw new Error(`Invalid key in line ${ctx.line}, col ${ctx.column} : key="${str}" start character cannot be a number`);
                    }
                    state = ParserState.None;
                    kv = {
                        Type: KeyValues3Type.KeyValue_String,
                        Key: str,
                        Value: '',
                    };
                    str = '';
                    if (code === EQUAL) {
                        state = ParserState.Value;
                        continue;
                    }
                    continue;
                }
                const list = c.match(/[a-zA-Z0-9_]/);
                if (list && list[0] === c) {
                    str += c;
                }
                else {
                    throw new Error(`Invalid key in line ${ctx.line}, col ${ctx.column} : key="${str}" char='${c}'`);
                }
            }
            else {
                if (c === "\\") {
                    str += c + String.fromCharCode(ctx.content[ctx.index + 1]);
                    ctx.index += 1;
                    continue;
                }
                if (c === "\"") {
                    state = ParserState.None;
                    kv = {
                        Type: KeyValues3Type.KeyValue_String,
                        Key: str,
                        Value: '',
                    };
                    str = '';
                    continue;
                }
                str += c;
                continue;
            }
        }
        // Merge value
        if (state === ParserState.Value) {
            if (kv === null) {
                throw new Error(`Not readable in line ${ctx.line}, col ${ctx.column} : ${c} ：KeyValues3 object is null`);
            }
            if (str.length <= 0 && isSpace) {
                continue;
            }
            if (code === LR) {
                continue;
            }
            // If {
            if (code === LeftBrace) {
                ctx.index++;
                kv.Type = KeyValues3Type.KeyValue_Object;
                kv.Value = await _keyValues3Parser(ctx);
                result.push(kv);
                kv = null;
                str = '';
                state = ParserState.None;
                continue;
            }
            // If [
            if (code === LeftBracket) {
                ctx.index++;
                kv.Type = KeyValues3Type.KeyValue_Array;
                kv.Value = await _keyValues3Parser(ctx, true);
                result.push(kv);
                kv = null;
                str = '';
                state = ParserState.None;
                continue;
            }
            // If string
            if (c === "\"") {
                state = ParserState.String;
                str += c;
                continue;
            }
            if (isSpace || (isArray && (code === COMMA || code === RightBracket)) || code === RightBrace) {
                // Boolean
                if (str === 'true' || str === 'false') {
                    kv.Type = KeyValues3Type.KeyValue_Boolean;
                }
                else {
                    // Int or Double
                    const nums = str.match(/\-?[\d\.]+/);
                    if (nums && nums[0] === str) {
                        const pointIndex = str.indexOf('.');
                        if (pointIndex >= 0) {
                            if (pointIndex !== str.lastIndexOf('.')) {
                                throw new Error(`Not readable in line ${ctx.line}, value: ${str}`);
                            }
                            kv.Type = KeyValues3Type.KeyValue_Double;
                        }
                        else {
                            kv.Type = KeyValues3Type.KeyValue_Int;
                        }
                    }
                }
                kv.Value = str;
                result.push(kv);
                kv = null;
                str = '';
                state = ParserState.None;
                if (!isArray && code === COMMA) {
                    throw new Error(`Not readable in line ${ctx.line}, col ${ctx.column} : ${c}`);
                }
                if (code === RightBrace || code === RightBracket) {
                    break;
                }
                continue;
            }
            if (code === COMMA) {
                throw new Error(`Not readable in line ${ctx.line}, col ${ctx.column} : ${c}`);
            }
            str += c;
            continue;
        }
    }
    return result;
}
exports.default = {
    readFromFile,
    readFromString,
    formatKeyValues,
    KeyValues3Type,
};
//# sourceMappingURL=kv3.js.map