import { KeyValuesComments } from './Comments';
export default class KeyValues {
    Key: string;
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
    Comments: KeyValuesComments;
    constructor(Key: string, defaultValue?: string | KeyValues[]);
    /**
     * The parent of this KeyValues
     */
    GetParent(): KeyValues | undefined;
    /**
     * Return true that the KeyValues is root.
     */
    IsRoot(): boolean;
    /**
     * The key is #base?
     */
    IsBase(): boolean;
    /**
     * The children of this KeyValues,
     * if no children then return empty array.
     */
    GetChildren(): Readonly<KeyValues[]>;
    GetChildCount(): number;
    GetFirstChild(): KeyValues | undefined;
    GetLastChild(): KeyValues | undefined;
    /**
     * Create a KeyValues to children and return it.
     */
    CreateChild(key: string, value: string | KeyValues[]): KeyValues;
    /**
     * The value of this KeyValues,
     * if no value then return empty string.
     */
    GetValue(): string;
    /**
     * Return true that the KeyValues exists children and no value.
     */
    HasChildren(): boolean;
    /**
     * Set value or children.
     */
    SetValue(v: string | KeyValues[]): this;
    /**
     * Append a KeyValues to children,
     * if no children then throw error.
     */
    Append(child: KeyValues): this;
    /**
     * Insert a KeyValues to children,
     * if no children then throw error.
     */
    Insert(child: KeyValues, index: number): this;
    /**
     * Find a KeyValues from children
     */
    Find(callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean): KeyValues | undefined;
    /**
     * Find all KeyValues from children
     */
    FindAll(callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean): KeyValues[];
    /**
     * Find a KeyValues
     */
    FindKey(key: string): KeyValues | undefined;
    /**
     * Find all KeyValues
     */
    FindAllKeys(...keys: string[]): KeyValues[];
    /**
     * Find a KeyValues from children and children's children...
     */
    FindRecursive(callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean): KeyValues | undefined;
    /**
     * Find a KeyValues from children and children's children...
     */
    protected static FindRecursive(root: KeyValues, callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean): KeyValues | undefined;
    /**
     * Delete a KeyValues from children
     */
    Delete(child: string | KeyValues): KeyValues | undefined;
    /**
     * Delete this KeyValues from parent
     */
    Free(): this;
    /**
     * Format KeyValues to file text
     */
    Format(tab?: string, maxLength?: number): string;
    toString(): string;
    /**
     * Create root node
     */
    static CreateRoot(): KeyValues;
    /**
     * Parse string
     */
    static Parse(body: string): KeyValues;
    protected static _parse(data: {
        body: string;
        pos: number;
        line: number;
    }, parent: KeyValues): void;
}
