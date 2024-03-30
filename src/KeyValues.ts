import { getKeyValuesAdapter } from './adapter';
import { KeyValuesComments } from './Comments';

const KeyValuesRootKey = '__KeyValues_Root__';

function createID() {
    const adapter = getKeyValuesAdapter();
    return adapter.createKeyValuesID();
}

export default class KeyValues {
    private __filename?: string;

    public get filename() {
        return this.__filename || '';
    }

    public set filename(s: string | undefined) {
        this.__filename = s ? s.replace(/\\/g, '/') : s;
    }

    /**
     * The children of this KeyValues
     */
    protected children?: KeyValues[];
    /**
     * The value of this KeyValues
     */
    protected value?: string;
    /**
     * The parent of this KeyValues,
     */
    protected parent?: KeyValues;
    /**
     * Comment
     */
    public Comments = new KeyValuesComments();
    /**
     * The KeyValues flags, such as [$WIN32] [$X360]
     */
    public Flags: string = '';
    /**
     * Unique id of KeyValues
     */
    public readonly ID = createID();

    constructor(
        public Key: string,
        defaultValue?: string | KeyValues[],
    ) {
        this.SetValue(defaultValue || '');
    }

    /**
     * The parent of this KeyValues
     */
    public GetParent() {
        return this.parent;
    }

    /**
     * Return true that the KeyValues is root.
     */
    public IsRoot() {
        return this.Key === KeyValuesRootKey;
    }

    /**
     * The key is #base?
     */
    public IsBase() {
        return this.Key === '#base';
    }

    protected baseFilePath = '';

    /**
     * Return #base's value
     */
    public GetBaseFilePath() {
        return this.baseFilePath;
    }

    /**
     * KeyValues list of #base
     */
    public GetBaseList() {
        return this.FindAllKeys('#base');
    }

    /**
     * The children of this KeyValues,
     * if no children then return empty array.
     */
    public GetChildren(): Readonly<KeyValues[]> {
        return this.children || [];
    }

    public GetChildCount() {
        return this.GetChildren().length;
    }

    public GetFirstChild(): KeyValues | undefined {
        return this.GetChildren()[0];
    }

    public GetLastChild(): KeyValues | undefined {
        return this.GetChildren()[this.GetChildCount() - 1];
    }

    /**
     * Create a KeyValues to children and return it.
     */
    public CreateChild(key: string, value: string | KeyValues[]) {
        const kv = new KeyValues(key, value);
        this.Append(kv);
        return kv;
    }

    /**
     * The value of this KeyValues,
     * if no value then return empty string.
     */
    public GetValue() {
        return this.value || '';
    }

    /**
     * Return true that the KeyValues exists children and no value.
     */
    public HasChildren() {
        return !!this.children;
    }

    /**
     * Set value or children.
     */
    public SetValue(v: string | KeyValues[]) {
        if (Array.isArray(v)) {
            this.children = v.map((c) => c.Free());
            delete this.value;
            for (const kv of this.children) {
                if (kv === this) {
                    throw new Error(`SetValue(): The value can not includes self`);
                }
                kv.parent = this;
            }
        } else {
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
    public Append(child: KeyValues) {
        if (this.children) {
            if (child === this) {
                throw new Error(`Append(): Can not append self`);
            }
            this.children.push(child.Free());
            child.parent = this;
        } else {
            throw new Error(`The KeyValues [Key = ${this.Key}] does not have children`);
        }
        return this;
    }

    /**
     * Insert a KeyValues to children,
     * if no children then throw error.
     */
    public Insert(child: KeyValues, index: number) {
        if (this.children) {
            if (child === this) {
                throw new Error(`Insert(): Can not insert self`);
            }
            this.children.splice(index, 0, child.Free());
            child.parent = this;
        } else {
            throw new Error(`The KeyValues [Key = ${this.Key}] does not have children`);
        }
        return this;
    }

    /**
     * Find a KeyValues from children
     */
    public Find(
        callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean,
    ): KeyValues | undefined {
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
    public FindAll(
        callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean,
    ): KeyValues[] {
        if (!this.children) {
            return [];
        }
        const result: KeyValues[] = [];
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
    public FindKey(key: string) {
        return this.Find((kv) => kv.Key === key);
    }

    /**
     * Find all KeyValues
     */
    public FindAllKeys(...keys: string[]) {
        return this.FindAll((kv) => keys.includes(kv.Key));
    }

    /**
     * Find a KeyValues from children and children's children...
     */
    public FindTraverse(
        callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean,
    ): KeyValues | undefined {
        if (!this.children) {
            return;
        }
        return KeyValues.FindTraverse(this, callback);
    }

    /**
     * Find a KeyValues from children and children's children...
     */
    protected static FindTraverse(
        root: KeyValues,
        callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean,
    ): KeyValues | undefined {
        if (root.HasChildren()) {
            for (const [i, kv] of root.GetChildren().entries()) {
                if (callback(kv, i, root) === true) {
                    return kv;
                }
                const result = KeyValues.FindTraverse(kv, callback);
                if (result) {
                    return result;
                }
            }
        }
    }

    /**
     * Find child from the current KeyValues
     */
    public FindID(id: string): KeyValues | undefined {
        return this.Find((kv) => kv.ID === id);
    }

    /**
     * Recursively iterate through all children to find the value that matches the ID
     */
    public FindIDTraverse(id: string): KeyValues | undefined {
        return this.FindTraverse((kv) => kv.ID === id);
    }

    /**
     * Delete a KeyValues from children
     */
    public Delete(child: string | KeyValues): KeyValues | undefined {
        if (!this.children) {
            return;
        }
        let kv: KeyValues | undefined;
        if (typeof child === 'string') {
            kv = this.children.find((v) => v.Key === child);
        } else {
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
    public Free() {
        if (this.parent) {
            this.parent.Delete(this);
            delete this.parent;
        }
        return this;
    }

    /**
     * Format KeyValues to file text
     */
    public Format(tab: string = '', maxLength: number = -1): string {
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
            if (this.IsBase()) {
                text += `${tab}${this.Key}    "${this.GetBaseFilePath()}"`;
                if (this.Comments.HasEndOfLineComment()) {
                    text += ` // ${this.Comments.GetEndOfLineComment()}`;
                }
                return text;
            }
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
        } else {
            if (this.IsBase()) {
                text += `${tab}${this.Key}    "${this.value}"`;
                if (this.Comments.HasEndOfLineComment()) {
                    text += ` // ${this.Comments.GetEndOfLineComment()}`;
                }
            } else {
                text += `${tab}"${this.Key}"${' '.repeat(
                    Math.max(0, maxLength - this.Key.length),
                )}`;
                text += `    "${this.value}"`;
                if (this.Comments.HasEndOfLineComment()) {
                    text += ` // ${this.Comments.GetEndOfLineComment()}`;
                }
            }
        }
        return text;
    }

    public toString() {
        return this.Format();
    }

    /**
     * Deep clone KeyValues
     */
    public Clone(): KeyValues {
        if (!this.children) {
            return new KeyValues(this.Key, this.value);
        }
        return new KeyValues(
            this.Key,
            this.children.map((v) => v.Clone()),
        );
    }

    /**
     * Create root node
     */
    public static CreateRoot() {
        return new KeyValues(KeyValuesRootKey, []);
    }

    /**
     * Parse string
     */
    public static async Parse(body: string, filename?: string): Promise<KeyValues> {
        let root = this.CreateRoot();
        root.filename = filename;
        this._parse({ body, pos: 0, line: 1 }, root);

        // Load #base
        if (filename) {
            const baseList = root.FindAllKeys('#base');
            const adapter = getKeyValuesAdapter();
            for (const base of baseList) {
                const v = base.GetValue().trim();
                if (v) {
                    base.baseFilePath = v;
                    const filePath = adapter.resolvePath(filename, v);
                    const baseKV = await KeyValues.Load(filePath);
                    base.filename = baseKV.filename;
                    base.SetValue(baseKV.GetChildren().map((v) => v.Free()));
                }
            }
        }

        return root;
    }

    protected static _parse(data: { body: string; pos: number; line: number }, parent: KeyValues) {
        let kv = new KeyValues('');
        let key = false;
        let leftMark = false;
        let inQoute = false;
        let str = '';
        let isEndOfLineComment = false;
        let lastKV: KeyValues | undefined;
        let matchFlag = false;
        for (; data.pos < data.body.length; data.pos++) {
            const c = data.body[data.pos];
            const isNewLine = c === '\n';
            const isSpace = isNewLine || c === ' ' || c === '\t' || c === '\r';

            if (isNewLine) {
                data.line += 1;
                isEndOfLineComment = false;
            }

            // Merge flags text
            if (lastKV && matchFlag) {
                if (c === ']') {
                    lastKV.Flags = str;
                    matchFlag = false;
                    str = '';
                    continue;
                }
                str += c;
                continue;
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
                        } else {
                            kv.SetValue(str);
                            parent.Append(kv);
                            lastKV = kv;
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
                    } else {
                        kv.SetValue(str);
                        parent.Append(kv);
                        lastKV = kv;
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
                            } else {
                                const lastChild = parent.GetLastChild();
                                if (lastChild) {
                                    lastChild.Comments.SetEndOfLineComment(comment);
                                }
                            }
                        } else {
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
                lastKV = kv;
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

            // Match flag
            if (lastKV && c === '[') {
                str = '';
                matchFlag = true;
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

    /**
     * Convert KeyValues to object and exclude comments.
     */
    public toObject<T = any>(): T {
        const obj: any = {};
        if (!this.HasChildren()) {
            throw Error('Not found children in this KeyValues');
        }

        for (const kv of this.children!) {
            if (!kv.HasChildren()) {
                obj[kv.Key] = kv.GetValue();
            } else {
                obj[kv.Key] = kv.toObject();
            }
        }

        return obj;
    }

    /**
     * Load KeyValues from file
     */
    public static async Load(filename: string, encoding?: string): Promise<KeyValues> {
        const adapter = getKeyValuesAdapter();
        const text = await adapter.readFile(filename, encoding);
        if (text.charCodeAt(0) === 0xfeff) {
            return await this.Parse(text.slice(1), filename);
        }
        return await this.Parse(text, filename);
    }

    /**
     * Save KeyValues to file
     */
    public async Save(otherFilename?: string, encoding?: string): Promise<void> {
        const filename = otherFilename ?? this.filename;
        if (!filename) {
            throw new Error('Not found filename in KeyValues');
        }
        const adapter = getKeyValuesAdapter();
        await adapter.writeFile(filename, this.Format(), encoding);

        // Save #base
        const baseList = this.FindAllKeys('#base');
        for (const base of baseList) {
            const content = base
                .GetChildren()
                .map((v) => v.Format())
                .join('\n');
            if (otherFilename) {
                const filePath = adapter.resolvePath(filename, base.GetBaseFilePath());
                await adapter.writeFile(filePath, content, encoding);
            } else {
                await adapter.writeFile(base.filename!, content, encoding);
            }
        }
    }
}
