'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');

class KeyValuesComments {
    constructor(comments = [], endOfLineComment = '') {
        this.comments = comments;
        this.endOfLineComment = endOfLineComment;
    }
    GetComments() {
        return this.comments;
    }
    HasComments() {
        return this.comments.length > 0;
    }
    SetComments(list) {
        for (const v of list) {
            if (v.includes('\n')) {
                throw Error('The comment only allowed one line');
            }
        }
        this.comments = list;
        return this;
    }
    AppendComment(text) {
        if (text.includes('\n')) {
            throw Error('The comment only allowed one line');
        }
        this.comments.push(text);
        return this;
    }
    SetEndOfLineComment(text) {
        if (text.includes('\n')) {
            throw Error('The comment only allowed one line');
        }
        this.endOfLineComment = text;
        return this;
    }
    GetEndOfLineComment() {
        return this.endOfLineComment;
    }
    HasEndOfLineComment() {
        return this.endOfLineComment.length > 0;
    }
}
class KeyValues3Comments {
    constructor(comments = [], endOfLineComment = '') {
        this.comments = comments;
        this.endOfLineComment = endOfLineComment;
    }
    GetComments() {
        return this.comments;
    }
    HasComments() {
        return this.comments.length > 0;
    }
    SetComments(list) {
        this.comments = list;
        return this;
    }
    AppendComment(text) {
        this.comments.push(text);
        return this;
    }
    SetEndOfLineComment(text) {
        if (text.includes('\n')) {
            throw Error('The end of line comment only allowed one line');
        }
        this.endOfLineComment = text;
        return this;
    }
    GetEndOfLineComment() {
        return this.endOfLineComment;
    }
    HasEndOfLineComment() {
        return this.endOfLineComment.length > 0;
    }
    Format(tab = '') {
        let text = '';
        for (const comment of this.comments) {
            if (comment.includes('\n')) {
                const lines = comment.split('\n').map((v) => v.trimStart());
                text += `${tab}/*\n`;
                if (lines.some((v) => v.startsWith('*'))) {
                    text += lines
                        .map((v) => {
                        if (v.startsWith('*')) {
                            v = v.trimStart();
                        }
                        else {
                            v = '* ' + v.trimStart();
                        }
                        return `${tab} ` + v + '\n';
                    })
                        .join('');
                    text += `${tab} */\n`;
                }
                else {
                    text += lines.map((v) => `${tab}` + v + '\n').join('');
                    text += `${tab}*/\n`;
                }
            }
            else {
                text += `${tab}// ${comment.trimStart()}\n`;
            }
        }
        return text;
    }
}

const KeyValuesRootKey = '__KeyValues_Root__';
class KeyValues {
    constructor(Key, defaultValue) {
        this.Key = Key;
        /**
         * Comment
         */
        this.Comments = new KeyValuesComments();
        this.SetValue(defaultValue || '');
    }
    /**
     * The parent of this KeyValues
     */
    GetParent() {
        return this.parent;
    }
    /**
     * Return true that the KeyValues is root.
     */
    IsRoot() {
        return this.Key === KeyValuesRootKey;
    }
    /**
     * The key is #base?
     */
    IsBase() {
        return this.Key === '#base';
    }
    /**
     * The children of this KeyValues,
     * if no children then return empty array.
     */
    GetChildren() {
        return this.children || [];
    }
    GetChildCount() {
        return this.GetChildren().length;
    }
    GetFirstChild() {
        return this.GetChildren()[0];
    }
    GetLastChild() {
        return this.GetChildren()[this.GetChildCount() - 1];
    }
    /**
     * Create a KeyValues to children and return it.
     */
    CreateChild(key, value) {
        const kv = new KeyValues(key, value);
        this.Append(kv);
        return kv;
    }
    /**
     * The value of this KeyValues,
     * if no value then return empty string.
     */
    GetValue() {
        return this.value || '';
    }
    /**
     * Return true that the KeyValues exists children and no value.
     */
    HasChildren() {
        return !!this.children;
    }
    /**
     * Set value or children.
     */
    SetValue(v) {
        if (Array.isArray(v)) {
            this.children = v.map((c) => c.Free());
            delete this.value;
            for (const kv of this.children) {
                if (kv === this) {
                    throw new Error(`SetValue(): The value can not includes self`);
                }
                kv.parent = this;
            }
        }
        else {
            if (this.IsRoot()) {
                throw new Error('The value of the root node kv must be an array');
            }
            this.value = v;
            delete this.children;
        }
        return this;
    }
    /**
     * Append a KeyValues to children,
     * if no children then throw error.
     */
    Append(child) {
        if (this.children) {
            if (child === this) {
                throw new Error(`Append(): Can not append self`);
            }
            this.children.push(child.Free());
            child.parent = this;
        }
        else {
            throw new Error(`The KeyValues [Key = ${this.Key}] does not have children`);
        }
        return this;
    }
    /**
     * Insert a KeyValues to children,
     * if no children then throw error.
     */
    Insert(child, index) {
        if (this.children) {
            if (child === this) {
                throw new Error(`Insert(): Can not insert self`);
            }
            this.children.splice(index, 0, child.Free());
            child.parent = this;
        }
        else {
            throw new Error(`The KeyValues [Key = ${this.Key}] does not have children`);
        }
        return this;
    }
    /**
     * Find a KeyValues from children
     */
    Find(callback) {
        if (!this.children) {
            return;
        }
        for (const [i, kv] of this.children.entries()) {
            if (callback(kv, i, this) === true) {
                return kv;
            }
        }
    }
    /**
     * Find all KeyValues from children
     */
    FindAll(callback) {
        if (!this.children) {
            return [];
        }
        const result = [];
        for (const [i, kv] of this.children.entries()) {
            if (callback(kv, i, this) === true) {
                result.push(kv);
            }
        }
        return result;
    }
    /**
     * Find a KeyValues
     */
    FindKey(key) {
        return this.Find((kv) => kv.Key === key);
    }
    /**
     * Find all KeyValues
     */
    FindAllKeys(...keys) {
        return this.FindAll((kv) => keys.includes(kv.Key));
    }
    /**
     * Find a KeyValues from children and children's children...
     */
    FindRecursive(callback) {
        if (!this.children) {
            return;
        }
        return KeyValues.FindRecursive(this, callback);
    }
    /**
     * Find a KeyValues from children and children's children...
     */
    static FindRecursive(root, callback) {
        if (root.HasChildren()) {
            for (const [i, kv] of root.GetChildren().entries()) {
                if (callback(kv, i, root) === true) {
                    return kv;
                }
                const result = KeyValues.FindRecursive(kv, callback);
                if (result) {
                    return result;
                }
            }
        }
    }
    /**
     * Delete a KeyValues from children
     */
    Delete(child) {
        if (!this.children) {
            return;
        }
        let kv;
        if (typeof child === 'string') {
            kv = this.children.find((v) => v.Key === child);
        }
        else {
            kv = this.children.find((v) => v === child);
        }
        if (kv) {
            this.children = this.children.filter((v) => v !== kv);
            kv.Free();
        }
        return kv;
    }
    /**
     * Delete this KeyValues from parent
     */
    Free() {
        if (this.parent) {
            this.parent.Delete(this);
            delete this.parent;
        }
        return this;
    }
    /**
     * Format KeyValues to file text
     */
    Format(tab = '', maxLength = -1) {
        if (this.IsRoot()) {
            if (!this.children) {
                throw new Error('The value of the root node kv must be an array');
            }
            return this.children.map((v) => v.Format()).join('\n');
        }
        let text = '';
        if (this.Comments.HasComments()) {
            text += this.Comments.GetComments()
                .map((v) => `${tab}// ${v.trimStart()}\n`)
                .join('');
        }
        if (this.children) {
            const maxLength = Math.max(...this.children.map((v) => v.Key.length));
            text += `${tab}"${this.Key}"`;
            if (this.Comments.HasEndOfLineComment()) {
                text += ` // ${this.Comments.GetEndOfLineComment()}`;
            }
            text += `\n${tab}{`;
            for (const kv of this.children) {
                text += '\n' + kv.Format(tab + '    ', maxLength);
            }
            text += `\n${tab}}`;
        }
        else {
            if (this.IsBase()) {
                text += `${tab}${this.Key}    "${this.value}"`;
                if (this.Comments.HasEndOfLineComment()) {
                    text += ` // ${this.Comments.GetEndOfLineComment()}`;
                }
            }
            else {
                text += `${tab}"${this.Key}"${' '.repeat(Math.max(0, maxLength - this.Key.length))}`;
                text += `    "${this.value}"`;
                if (this.Comments.HasEndOfLineComment()) {
                    text += ` // ${this.Comments.GetEndOfLineComment()}`;
                }
            }
        }
        return text;
    }
    toString() {
        return this.Format();
    }
    /**
     * Create root node
     */
    static CreateRoot() {
        return new KeyValues(KeyValuesRootKey, []);
    }
    /**
     * Parse string
     */
    static Parse(body) {
        let root = this.CreateRoot();
        this._parse({ body, pos: 0, line: 1 }, root);
        return root;
    }
    static _parse(data, parent) {
        let kv = new KeyValues('');
        let key = false;
        let leftMark = false;
        let inQoute = false;
        let str = '';
        let isEndOfLineComment = false;
        for (; data.pos < data.body.length; data.pos++) {
            const c = data.body[data.pos];
            const isNewLine = c === '\n';
            const isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
            if (isNewLine) {
                data.line += 1;
                isEndOfLineComment = false;
            }
            // If leftMark is true then merge char to str
            if (leftMark) {
                if (!inQoute) {
                    if (c === '{' || c === '"' || c === '[' || c === ']') {
                        throw Error(`Not readable in line ${data.line}`);
                    }
                    if (isSpace || c === '}') {
                        if (key) {
                            kv.Key = str;
                        }
                        else {
                            kv.SetValue(str);
                            parent.Append(kv);
                            kv = new KeyValues('');
                        }
                        leftMark = false;
                        inQoute = false;
                        str = '';
                        if (c === '}') {
                            data.pos--;
                        }
                        continue;
                    }
                    str += c;
                    continue;
                }
                if (c === '\\') {
                    data.pos++;
                    str += c + data.body[data.pos];
                    continue;
                }
                if (c === '"') {
                    if (key) {
                        kv.Key = str;
                    }
                    else {
                        kv.SetValue(str);
                        parent.Append(kv);
                        kv = new KeyValues('');
                    }
                    leftMark = false;
                    inQoute = false;
                    str = '';
                    continue;
                }
                str += c;
                continue;
            }
            // if comment
            if (c === '/') {
                if (data.body[data.pos + 1] === '*') {
                    throw Error(`Line ${data.line}: not support multi-line comment`);
                }
                if (data.body[data.pos + 1] === '/') {
                    const endIndex = data.body.indexOf('\n', data.pos + 1);
                    const comment = data.body.slice(data.pos + 2, endIndex).trim();
                    if (comment) {
                        if (isEndOfLineComment) {
                            if (key) {
                                kv.Comments.SetEndOfLineComment(comment);
                            }
                            else {
                                const lastChild = parent.GetLastChild();
                                lastChild === null || lastChild === void 0 ? void 0 : lastChild.Comments.SetEndOfLineComment(comment);
                            }
                        }
                        else {
                            kv.Comments.AppendComment(comment);
                        }
                    }
                    isEndOfLineComment = false;
                    data.pos = endIndex;
                    continue;
                }
            }
            // If open breace
            if (c === '{') {
                data.pos++;
                kv.SetValue([]);
                parent.Append(kv);
                this._parse(data, kv);
                kv = new KeyValues('');
                key = false;
                continue;
            }
            // If close breace
            if (c === '}') {
                data.pos++;
                break;
            }
            // If space
            if (isSpace) {
                continue;
            }
            // start merge char
            key = !key;
            leftMark = true;
            inQoute = c === '"';
            str = inQoute ? '' : c;
            isEndOfLineComment = true;
        }
    }
}

class KV3BaseValue {
    constructor(owner) {
        this.Comments = new KeyValues3Comments();
        this.owner = owner;
    }
    GetValue() {
        return this.value;
    }
    GetOwner() {
        return this.owner;
    }
    SetOwner(owner) {
        this.owner = owner;
    }
    IsBoolean() {
        return this instanceof ValueBoolean;
    }
    IsInt() {
        return this instanceof ValueInt;
    }
    IsDouble() {
        return this instanceof ValueDouble;
    }
    IsString() {
        return this instanceof ValueString;
    }
    IsResource() {
        return this instanceof ValueResource;
    }
    IsDeferredResource() {
        return this instanceof ValueDeferredResource;
    }
    IsArray() {
        return this instanceof ValueArray;
    }
    IsObject() {
        return this instanceof ValueObject;
    }
    Format() {
        return String(this.value);
    }
}
/**
 * String
 */
class ValueString extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = '';
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = String(v);
        return this;
    }
    Format() {
        if (this.value.includes('\n')) {
            return `"""${this.value}"""`;
        }
        return `"${this.value}"`;
    }
}
/**
 * Boolean
 */
class ValueBoolean extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = false;
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = v === true;
        return this;
    }
}
/**
 * Int
 */
class ValueInt extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = 0;
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = Math.floor(v);
        return this;
    }
}
/**
 * Double
 */
class ValueDouble extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = 0;
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = v;
        return this;
    }
    Format() {
        return this.value.toFixed(6);
    }
}
/**
 * resource:""
 */
class ValueResource extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = '';
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = v;
        return this;
    }
    Format() {
        return `resource:"${this.value}"`;
    }
}
/**
 * deferred_resource:""
 */
class ValueDeferredResource extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = '';
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        this.value = v;
        return this;
    }
    Format() {
        return `deferred_resource:"${this.value}"`;
    }
}
/**
 * Array
 */
class ValueArray extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = [];
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(list) {
        this.value = list.map((v) => v);
        return this;
    }
    Append(v) {
        this.value.push(v);
        return this;
    }
    Insert(v, index) {
        this.value.splice(index, 0, v);
        return this;
    }
    Delete(v) {
        const i = this.value.indexOf(v);
        if (i >= 0) {
            this.value.splice(i, 1);
        }
        return this;
    }
    Format(tab = '') {
        let text = '';
        let oneLine = true;
        if (this.value.some((v) => v.IsArray() ||
            v.IsObject() ||
            v.Comments.HasComments() ||
            v.Comments.HasEndOfLineComment())) {
            oneLine = false;
        }
        else {
            const max = this.value.reduce((pv, v) => pv + v.Format().length, 0);
            if (max > 64) {
                oneLine = false;
            }
        }
        if (oneLine) {
            text = ` [ `;
            text += this.value
                .map((v) => {
                return v.Format();
            })
                .join(', ');
            text += ` ]`;
        }
        else {
            text = `\n${tab}[`;
            text += this.value
                .map((v) => {
                let comment = '';
                let endComment = '';
                if (v.Comments.HasComments()) {
                    comment = '\n' + v.Comments.Format(tab + '    ').trimEnd();
                }
                if (v.Comments.HasEndOfLineComment()) {
                    endComment = ` // ${v.Comments.GetEndOfLineComment()}`;
                }
                if (v.IsArray()) {
                    let str = v.Format(tab + '    ');
                    if (!str.startsWith('\n')) {
                        str = '\n' + tab + '   ' + str;
                    }
                    return comment + str + ',' + endComment;
                }
                else if (v.IsObject()) {
                    return comment + v.Format(tab + '    ') + ',' + endComment;
                }
                return comment + '\n' + tab + '    ' + v.Format() + ',' + endComment;
            })
                .join('');
            text += `\n${tab}]`;
        }
        return text;
    }
}
/**
 * Object
 */
class ValueObject extends KV3BaseValue {
    constructor(initValue) {
        super();
        this.value = [];
        if (initValue) {
            this.SetValue(initValue);
        }
    }
    GetValue() {
        return this.value;
    }
    SetValue(list) {
        this.value = [...list];
        return this;
    }
    Create(key, value) {
        const kv = new KeyValues3(key, value);
        this.Append(kv);
        return kv;
    }
    Append(v) {
        this.value.push(v);
        return this;
    }
    Insert(v, index) {
        this.value.splice(index, 0, v);
        return this;
    }
    Delete(v) {
        let kv;
        if (typeof v === 'string') {
            kv = this.value.find((c) => c.Key === v);
        }
        else {
            kv = this.value.find((c) => c === v);
        }
        if (kv) {
            this.value.splice(this.value.indexOf(kv), 1);
        }
        return kv;
    }
    /**
     * Find a KeyValues3
     */
    Find(callback) {
        for (const [i, kv] of this.value.entries()) {
            if (callback(kv, i, this) === true) {
                return kv;
            }
        }
    }
    /**
     * Find a KeyValues3
     */
    FindKey(key) {
        return this.Find((kv) => kv.Key === key);
    }
    /**
     * Find a KeyValues3
     */
    FindAll(callback) {
        const result = [];
        for (const [i, kv] of this.value.entries()) {
            if (callback(kv, i, this) === true) {
                result.push(kv);
            }
        }
        return result;
    }
    /**
     * Find a KeyValues3
     */
    FindAllKeys(...keys) {
        return this.FindAll((kv) => keys.includes(kv.Key));
    }
    Format(tab = '') {
        let text = `\n${tab}{`;
        text += this.value.map((v) => '\n' + v.Format(tab + '    ')).join('');
        text += `\n${tab}}`;
        return text;
    }
}
const MatchKeyNoQuote = /^[\w\d_\.]+$/;
const MatchInt = /^-?\d+$/;
const MatchDouble = /^-?\d+.\d+$/;
const MatchDouble2 = /^-?.\d+$/;
const MatchDouble3 = /^-?\d+.$/;
const MatchStrangeNumber = /^[\d\+-\.]+$/;
const MatchBoolean = /^(true|false)$/;
const MatchResource = /^resource:"(.*)"$/;
const MatchDeferredResource = /^deferred_resource:"(.*)"$/;
/**
 * https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3
 */
class KeyValues3 {
    constructor(Key, defaultValue) {
        this.Key = Key;
        this.value = defaultValue;
        this.value.SetOwner(this);
    }
    IsRoot() {
        return !!this.header;
    }
    GetHeader() {
        return this.header;
    }
    static CreateRoot() {
        const kv = new KeyValues3('', new ValueObject());
        kv.header = this.CommonHeader;
        return kv;
    }
    GetValue() {
        return this.value;
    }
    SetValue(v) {
        if (this.IsRoot() && !v.IsObject()) {
            throw Error('The root node of KeyValues3 must be an object');
        }
        this.value = v;
    }
    CreateObjectValue(key, value) {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.Create(key, value);
    }
    AppendValue(value) {
        if (!this.value.IsArray()) {
            throw Error('The KeyValues3 is not an array');
        }
        return this.value.Append(value);
    }
    Find(callback) {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.Find(callback);
    }
    FindKey(key) {
        return this.Find((kv) => kv.Key === key);
    }
    FindAll(callback) {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.FindAll(callback);
    }
    FindAllKeys(...keys) {
        return this.FindAll((kv) => keys.includes(kv.Key));
    }
    Format(tab = '') {
        let text = '';
        let prefix = '';
        const root = this.IsRoot();
        if (MatchKeyNoQuote.test(this.Key)) {
            prefix = `${tab}${this.Key} =`;
        }
        else {
            prefix = `${tab}"${this.Key}" =`;
        }
        if (root) {
            text += this.header;
        }
        if (this.value.Comments.HasComments()) {
            text += this.value.Comments.Format(tab);
        }
        if (this.value.IsArray()) {
            text += prefix;
            text += this.value.Format(tab);
        }
        else if (this.value.IsObject()) {
            if (root) {
                text += this.value.Format(tab);
            }
            else {
                text += prefix;
                text += this.value.Format(tab);
            }
        }
        else {
            text += prefix + ` ${this.value.Format()}`;
        }
        if (this.value.Comments.HasEndOfLineComment()) {
            text += ` // ${this.value.Comments.GetEndOfLineComment()}`;
        }
        return text;
    }
    toString() {
        return this.Format();
    }
    static Parse(body) {
        let root = this.CreateRoot();
        const firstLineIndex = body.indexOf('\n');
        const header = body.slice(0, firstLineIndex).trim();
        if (!header.startsWith('<!--') || !header.endsWith('-->')) {
            throw Error('Invalid header');
        }
        this._parse(root, {
            body,
            line: 2,
            pos: body.indexOf('{', firstLineIndex) + 1,
            tokenCounter: 1,
        });
        return root;
    }
    static _parse(parent, data) {
        var _a, _b;
        if (parent.value.IsObject()) {
            let isKey = true;
            let startMark = false;
            let inQoute = false;
            let key = '';
            let str = '';
            let isEndOfLineComment = false;
            let commentCache = [];
            let lastKV;
            for (; data.pos < data.body.length; data.pos++) {
                const c = data.body[data.pos];
                const isNewLine = c === '\n';
                const isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
                if (isNewLine) {
                    data.line += 1;
                    isEndOfLineComment = false;
                }
                if (startMark) {
                    if (isKey) {
                        // isKey
                        if (inQoute) {
                            if (c === '\\') {
                                str += c + data.body[data.pos + 1];
                                data.pos += 1;
                                continue;
                            }
                            if (c === '"') {
                                key = str;
                                str = '';
                                startMark = false;
                                continue;
                            }
                            else {
                                str += c;
                                continue;
                            }
                        }
                        else {
                            if (isSpace || c === '=') {
                                key = str;
                                str = '';
                                startMark = false;
                                if (c === '=') {
                                    data.pos -= 1;
                                }
                                continue;
                            }
                            str += c;
                            continue;
                        }
                        // isKey
                    }
                    else {
                        // not isKey
                        if (inQoute) {
                            if (c === '\\') {
                                str += c + data.body[data.pos + 1];
                                data.pos += 1;
                                continue;
                            }
                            if (c === '"') {
                                if (str.length <= 0) {
                                    // check start on multi-line
                                    if (data.body[data.pos + 1] === '"') {
                                        if (data.body[data.pos + 2] !== '\n' &&
                                            data.body[data.pos + 2] !== '\r') {
                                            throw new Error(this._parse_error(data.line, `multi-line start identifier """ must be followed by newline`));
                                        }
                                        data.pos += 1;
                                        continue;
                                    }
                                }
                                else {
                                    // check end on multi-line
                                    if (data.body[data.pos + 1] === '"') {
                                        if (data.body[data.pos + 2] === '"') {
                                            if (data.body[data.pos - 1] !== '\n') {
                                                throw new Error(this._parse_error(data.line, `multi-line end identifier """ must be at the beginning of line`));
                                            }
                                            data.pos += 2;
                                        }
                                        else {
                                            throw new Error(this._parse_error(data.line, `multi-line string must be end with """`));
                                        }
                                    }
                                }
                                lastKV = parent.CreateObjectValue(key, new ValueString(str));
                                lastKV.value.Comments.SetComments(commentCache);
                                commentCache = [];
                                key = '';
                                str = '';
                                isKey = true;
                                inQoute = false;
                                startMark = false;
                                continue;
                            }
                            else {
                                str += c;
                                continue;
                            }
                        }
                        else {
                            if (isSpace || c === ']' || c === '}') {
                                if (MatchBoolean.test(str)) {
                                    lastKV = parent.CreateObjectValue(key, new ValueBoolean(str === 'true'));
                                }
                                else if (MatchInt.test(str)) {
                                    lastKV = parent.CreateObjectValue(key, new ValueInt(parseInt(str)));
                                }
                                else if (MatchDouble.test(str) ||
                                    MatchDouble2.test(str) ||
                                    MatchDouble3.test(str)) {
                                    lastKV = parent.CreateObjectValue(key, new ValueDouble(Number(str)));
                                }
                                else if (MatchResource.test(str)) {
                                    const m = MatchResource.exec(str);
                                    let v = m ? m[1] : '';
                                    lastKV = parent.CreateObjectValue(key, new ValueResource(v));
                                }
                                else if (MatchDeferredResource.test(str)) {
                                    const m = MatchDeferredResource.exec(str);
                                    let v = m ? m[1] : '';
                                    lastKV = parent.CreateObjectValue(key, new ValueDeferredResource(v));
                                }
                                else if (MatchStrangeNumber.test(str)) {
                                    lastKV = parent.CreateObjectValue(key, new ValueString(str));
                                }
                                else {
                                    throw new Error(this._parse_error(data.line, `Invalid value '${str}'`));
                                }
                                lastKV.value.Comments.SetComments(commentCache);
                                commentCache = [];
                                key = '';
                                str = '';
                                isKey = true;
                                inQoute = false;
                                startMark = false;
                                if (c === ']' || c === '}') {
                                    data.pos -= 1;
                                }
                                continue;
                            }
                            str += c;
                            continue;
                        }
                        // not isKey
                    }
                }
                if (c === '/') {
                    if (data.body[data.pos + 1] === '/') {
                        const nextIndex = data.body.indexOf('\n', data.pos + 2);
                        if (isEndOfLineComment && lastKV) {
                            lastKV.value.Comments.SetEndOfLineComment(data.body.slice(data.pos + 2, nextIndex).trimStart());
                            isEndOfLineComment = false;
                        }
                        else {
                            commentCache.push(data.body.slice(data.pos + 2, nextIndex).trimStart());
                        }
                        data.pos = nextIndex;
                        data.line += 1;
                        continue;
                    }
                    else if (data.body[data.pos + 1] === '*') {
                        const nextIndex = data.body.indexOf('*/', data.pos + 2);
                        commentCache.push(data.body.slice(data.pos + 2, nextIndex).trim());
                        data.pos = nextIndex + 1;
                        data.line += ((_a = data.body.slice(data.pos, nextIndex).match(/\n/g)) === null || _a === void 0 ? void 0 : _a.length) || 1;
                        continue;
                    }
                }
                if (c === '{') {
                    if (isKey) {
                        throw new Error(this._parse_error(data.line, `Invalid char '{'`));
                    }
                    const child = parent.CreateObjectValue(key, new ValueObject());
                    data.pos += 1;
                    data.tokenCounter += 1;
                    this._parse(child, data);
                    key = '';
                    str = '';
                    isKey = true;
                    inQoute = false;
                    startMark = false;
                    continue;
                }
                if (c === '[') {
                    if (isKey) {
                        throw new Error(this._parse_error(data.line, `Invalid char '['`));
                    }
                    const child = parent.CreateObjectValue(key, new ValueArray());
                    data.pos += 1;
                    data.tokenCounter += 1;
                    this._parse(child, data);
                    key = '';
                    str = '';
                    isKey = true;
                    inQoute = false;
                    startMark = false;
                    continue;
                }
                if (c === '}' || c === ']') {
                    data.tokenCounter += 1;
                    return;
                }
                if (isSpace) {
                    continue;
                }
                if (c === '=') {
                    if (key === '' && !inQoute) {
                        throw new Error(this._parse_error(data.line, `Invalid member name '='`));
                    }
                    if (!inQoute && !MatchKeyNoQuote.test(key)) {
                        throw new Error(this._parse_error(data.line, `Invalid member name '${key}'`));
                    }
                    isKey = false;
                    inQoute = false;
                    continue;
                }
                startMark = true;
                inQoute = c === '"';
                str = inQoute ? '' : c;
                isEndOfLineComment = true;
            }
        }
        else if (parent.value.IsArray()) {
            let startMark = false;
            let inQoute = false;
            let str = '';
            let expectedEnd = false;
            let isEndOfLineComment = false;
            let commentCache = [];
            let lastValue;
            for (; data.pos < data.body.length; data.pos++) {
                const c = data.body[data.pos];
                const isNewLine = c === '\n';
                const isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';
                if (isNewLine) {
                    data.line += 1;
                    isEndOfLineComment = false;
                }
                if (startMark) {
                    if (inQoute) {
                        if (c === '\\') {
                            str += c + data.body[data.pos + 1];
                            data.pos += 1;
                            continue;
                        }
                        if (c === '"') {
                            if (str.length <= 0) {
                                // check start on multi-line
                                if (data.body[data.pos + 1] === '"') {
                                    if (data.body[data.pos + 2] !== '\n' &&
                                        data.body[data.pos + 2] !== '\r') {
                                        throw new Error(this._parse_error(data.line, `multi-line start identifier """ must be followed by newline`));
                                    }
                                    data.pos += 1;
                                    continue;
                                }
                            }
                            else {
                                // check end on multi-line
                                if (data.body[data.pos + 1] === '"') {
                                    if (data.body[data.pos + 2] === '"') {
                                        if (data.body[data.pos - 1] !== '\n') {
                                            throw new Error(this._parse_error(data.line, `multi-line end identifier """ must be at the beginning of line`));
                                        }
                                        data.pos += 2;
                                    }
                                    else {
                                        throw new Error(this._parse_error(data.line, `multi-line string must be end with """`));
                                    }
                                }
                            }
                            lastValue = new ValueString(str);
                            parent.AppendValue(lastValue);
                            lastValue.Comments.SetComments(commentCache);
                            commentCache = [];
                            str = '';
                            inQoute = false;
                            startMark = false;
                            expectedEnd = true;
                            continue;
                        }
                        else {
                            str += c;
                            continue;
                        }
                    }
                    else {
                        if (isSpace || c === ',' || c === ']') {
                            if (MatchBoolean.test(str)) {
                                lastValue = new ValueBoolean(str === 'true');
                                parent.AppendValue(lastValue);
                            }
                            else if (MatchInt.test(str)) {
                                lastValue = new ValueInt(parseInt(str));
                                parent.AppendValue(lastValue);
                            }
                            else if (MatchDouble.test(str) ||
                                MatchDouble2.test(str) ||
                                MatchDouble3.test(str)) {
                                lastValue = new ValueDouble(Number(str));
                                parent.AppendValue(lastValue);
                            }
                            else if (MatchResource.test(str)) {
                                const m = MatchResource.exec(str);
                                let v = m ? m[1] : '';
                                lastValue = new ValueResource(v);
                                parent.AppendValue(lastValue);
                            }
                            else if (MatchDeferredResource.test(str)) {
                                const m = MatchDeferredResource.exec(str);
                                let v = m ? m[1] : '';
                                lastValue = new ValueDeferredResource(v);
                                parent.AppendValue(lastValue);
                            }
                            else if (MatchStrangeNumber.test(str)) {
                                lastValue = new ValueString(str);
                                parent.AppendValue(lastValue);
                            }
                            else {
                                throw new Error(this._parse_error(data.line, `Invalid value '${str}'`));
                            }
                            lastValue.Comments.SetComments(commentCache);
                            commentCache = [];
                            str = '';
                            inQoute = false;
                            startMark = false;
                            expectedEnd = c !== ',' && c !== ']';
                            if (c === ']') {
                                data.pos -= 1;
                            }
                            continue;
                        }
                        str += c;
                        continue;
                    }
                }
                if (c === '/') {
                    if (data.body[data.pos + 1] === '/') {
                        const nextIndex = data.body.indexOf('\n', data.pos + 2);
                        if (isEndOfLineComment && lastValue) {
                            lastValue.Comments.SetEndOfLineComment(data.body.slice(data.pos + 2, nextIndex).trimStart());
                            isEndOfLineComment = false;
                        }
                        else {
                            commentCache.push(data.body.slice(data.pos + 2, nextIndex).trimStart());
                        }
                        data.pos = nextIndex;
                        data.line += 1;
                        continue;
                    }
                    else if (data.body[data.pos + 1] === '*') {
                        const nextIndex = data.body.indexOf('*/', data.pos + 2);
                        commentCache.push(data.body.slice(data.pos + 2, nextIndex).trim());
                        data.pos = nextIndex + 1;
                        data.line += ((_b = data.body.slice(data.pos, nextIndex).match(/\n/g)) === null || _b === void 0 ? void 0 : _b.length) || 1;
                        continue;
                    }
                }
                if (expectedEnd) {
                    if (isSpace) {
                        continue;
                    }
                    if (c !== ',' && c !== ']') {
                        throw new Error(this._parse_error(data.line, `Expected ',' or ']'`));
                    }
                    expectedEnd = false;
                }
                if (c === ',') {
                    continue;
                }
                if (c === '{') {
                    const child = new KeyValues3('', new ValueObject());
                    data.pos += 1;
                    data.tokenCounter += 1;
                    this._parse(child, data);
                    child.value.SetOwner(parent);
                    parent.value.Append(child.value);
                    str = '';
                    inQoute = false;
                    startMark = false;
                    continue;
                }
                if (c === '[') {
                    const child = new KeyValues3('', new ValueArray());
                    data.pos += 1;
                    data.tokenCounter += 1;
                    this._parse(child, data);
                    child.value.SetOwner(parent);
                    parent.value.Append(child.value);
                    str = '';
                    inQoute = false;
                    startMark = false;
                    continue;
                }
                if (c === '}' || c === ']') {
                    data.tokenCounter += 1;
                    return;
                }
                if (isSpace) {
                    continue;
                }
                startMark = true;
                inQoute = c === '"';
                str = inQoute ? '' : c;
                isEndOfLineComment = true;
            }
        }
        else {
            throw Error("Parent's value must be an object or array");
        }
    }
    static _parse_error(line, msg) {
        return `not readable as KeyValues3 text: Line ${line}: ${msg}`;
    }
}
KeyValues3.String = ValueString;
KeyValues3.Boolean = ValueBoolean;
KeyValues3.Int = ValueInt;
KeyValues3.Double = ValueDouble;
KeyValues3.Resource = ValueResource;
KeyValues3.DeferredResource = ValueDeferredResource;
KeyValues3.Array = ValueArray;
KeyValues3.Object = ValueObject;
KeyValues3.CommonHeader = '<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->';

const { readFile, writeFile } = fs.promises;
async function LoadKeyValues(file, encoding = 'utf8') {
    const body = await readFile(file, encoding);
    return KeyValues.Parse(body);
}
function LoadKeyValuesSync(file, encoding = 'utf8') {
    const body = fs.readFileSync(file, encoding);
    return KeyValues.Parse(body);
}
async function SaveKeyValues(file, kv, encoding = 'utf8') {
    await writeFile(file, kv.Format(), encoding);
}
async function SaveKeyValuesSync(file, kv, encoding = 'utf8') {
    fs.writeFileSync(file, kv.Format(), encoding);
}
async function LoadKeyValues3(file, encoding = 'utf8') {
    const body = await readFile(file, encoding);
    return KeyValues3.Parse(body);
}
function LoadKeyValues3Sync(file, encoding = 'utf8') {
    const body = fs.readFileSync(file, encoding);
    return KeyValues3.Parse(body);
}
async function SaveKeyValues3(file, kv, encoding = 'utf8') {
    await writeFile(file, kv.Format(), encoding);
}
async function SaveKeyValues3Sync(file, kv, encoding = 'utf8') {
    fs.writeFileSync(file, kv.Format(), encoding);
}

exports.KeyValues = KeyValues;
exports.KeyValues3 = KeyValues3;
exports.LoadKeyValues = LoadKeyValues;
exports.LoadKeyValues3 = LoadKeyValues3;
exports.LoadKeyValues3Sync = LoadKeyValues3Sync;
exports.LoadKeyValuesSync = LoadKeyValuesSync;
exports.SaveKeyValues = SaveKeyValues;
exports.SaveKeyValues3 = SaveKeyValues3;
exports.SaveKeyValues3Sync = SaveKeyValues3Sync;
exports.SaveKeyValuesSync = SaveKeyValuesSync;
//# sourceMappingURL=node.js.map
