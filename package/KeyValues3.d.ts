import { KeyValues3Comments } from './Comments';
export interface IKV3Value {
    Comments: KeyValues3Comments;
    GetValue(): any;
    GetOwner(): KeyValues3 | undefined;
    SetOwner(owner: KeyValues3 | undefined): void;
    IsBoolean(): this is ValueBoolean;
    IsInt(): this is ValueInt;
    IsDouble(): this is ValueDouble;
    IsString(): this is ValueString;
    IsResource(): this is ValueResource;
    IsDeferredResource(): this is ValueDeferredResource;
    IsArray(): this is ValueArray;
    IsObject(): this is ValueObject;
    Format(): string;
}
export declare class KV3BaseValue implements IKV3Value {
    protected value: any;
    protected owner?: KeyValues3;
    Comments: KeyValues3Comments;
    constructor(owner?: KeyValues3);
    GetValue(): any;
    GetOwner(): KeyValues3 | undefined;
    SetOwner(owner: KeyValues3 | undefined): void;
    IsBoolean(): this is ValueBoolean;
    IsInt(): this is ValueInt;
    IsDouble(): this is ValueDouble;
    IsString(): this is ValueString;
    IsResource(): this is ValueResource;
    IsDeferredResource(): this is ValueDeferredResource;
    IsArray(): this is ValueArray;
    IsObject(): this is ValueObject;
    Format(): string;
}
/**
 * String
 */
declare class ValueString extends KV3BaseValue {
    protected value: string;
    constructor(initValue?: string);
    GetValue(): string;
    SetValue(v: string): this;
    Format(): string;
}
/**
 * Boolean
 */
declare class ValueBoolean extends KV3BaseValue {
    protected value: boolean;
    constructor(initValue?: boolean);
    GetValue(): boolean;
    SetValue(v: boolean): this;
}
/**
 * Int
 */
declare class ValueInt extends KV3BaseValue {
    protected value: number;
    constructor(initValue?: number);
    GetValue(): number;
    SetValue(v: number): this;
}
/**
 * Double
 */
declare class ValueDouble extends KV3BaseValue {
    protected value: number;
    constructor(initValue?: number);
    GetValue(): number;
    SetValue(v: number): this;
    Format(): string;
}
/**
 * resource:""
 */
declare class ValueResource extends KV3BaseValue {
    protected value: string;
    constructor(initValue?: string);
    GetValue(): string;
    SetValue(v: string): this;
    Format(): string;
}
/**
 * deferred_resource:""
 */
declare class ValueDeferredResource extends KV3BaseValue {
    protected value: string;
    constructor(initValue?: string);
    GetValue(): string;
    SetValue(v: string): this;
    Format(): string;
}
/**
 * Array
 */
declare class ValueArray extends KV3BaseValue {
    protected value: IKV3Value[];
    constructor(initValue?: IKV3Value[]);
    GetValue(): Readonly<IKV3Value[]>;
    SetValue(list: IKV3Value[]): this;
    Append(v: IKV3Value): this;
    Insert(v: IKV3Value, index: number): this;
    Delete(v: IKV3Value): this;
    Format(tab?: string): string;
}
/**
 * Object
 */
declare class ValueObject extends KV3BaseValue {
    protected value: KeyValues3[];
    constructor(initValue?: KeyValues3[]);
    GetValue(): Readonly<KeyValues3[]>;
    SetValue(list: KeyValues3[]): this;
    Create(key: string, value: IKV3Value): KeyValues3;
    Append(v: KeyValues3): this;
    Insert(v: KeyValues3, index: number): this;
    Delete(v: string | KeyValues3): KeyValues3 | undefined;
    /**
     * Find a KeyValues3
     */
    Find(callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean): KeyValues3 | undefined;
    /**
     * Find a KeyValues3
     */
    FindKey(key: string): KeyValues3 | undefined;
    /**
     * Find a KeyValues3
     */
    FindAll(callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean): KeyValues3[];
    /**
     * Find a KeyValues3
     */
    FindAllKeys(...keys: string[]): KeyValues3[];
    Format(tab?: string): string;
}
/**
 * https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3
 */
export default class KeyValues3 {
    Key: string;
    static String: typeof ValueString;
    static Boolean: typeof ValueBoolean;
    static Int: typeof ValueInt;
    static Double: typeof ValueDouble;
    static Resource: typeof ValueResource;
    static DeferredResource: typeof ValueDeferredResource;
    static Array: typeof ValueArray;
    static Object: typeof ValueObject;
    protected value: IKV3Value;
    protected header?: string;
    constructor(Key: string, defaultValue: IKV3Value);
    IsRoot(): boolean;
    GetHeader(): string | undefined;
    static CreateRoot(): KeyValues3;
    static CommonHeader: string;
    GetValue(): IKV3Value;
    SetValue(v: IKV3Value): void;
    CreateObjectValue(key: string, value: IKV3Value): KeyValues3;
    AppendValue(value: IKV3Value): ValueArray;
    Find(callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean): KeyValues3 | undefined;
    FindKey(key: string): KeyValues3 | undefined;
    FindAll(callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean): KeyValues3[];
    FindAllKeys(...keys: string[]): KeyValues3[];
    Format(tab?: string): string;
    toString(): string;
    static Parse(body: string): KeyValues3;
    protected static _parse(parent: KeyValues3, data: {
        body: string;
        line: number;
        pos: number;
        tokenCounter: number;
    }): void;
    protected static _parse_error(line: number, msg: string): string;
}
export {};
