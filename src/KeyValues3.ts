import { KeyValues3Comments } from './Comments';

enum KeyValues3ValueType {
    Boolean = 1,
    Int,
    Double,
    String,
    Resource,
    DeferredResource,
    Array,
    Object,
}

interface IKV3Value {
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

class BaseValue implements IKV3Value {
    protected value: any;
    protected owner?: KeyValues3;

    constructor(owner?: KeyValues3) {
        this.owner = owner;
    }

    public GetValue() {
        return this.value;
    }

    public GetOwner() {
        return this.owner;
    }

    SetOwner(owner: KeyValues3 | undefined): void {
        this.owner = owner;
    }

    public IsBoolean(): this is ValueBoolean {
        return this instanceof ValueBoolean;
    }
    public IsInt(): this is ValueInt {
        return this instanceof ValueInt;
    }
    public IsDouble(): this is ValueDouble {
        return this instanceof ValueDouble;
    }
    public IsString(): this is ValueString {
        return this instanceof ValueString;
    }
    public IsResource(): this is ValueResource {
        return this instanceof ValueResource;
    }
    public IsDeferredResource(): this is ValueDeferredResource {
        return this instanceof ValueDeferredResource;
    }
    public IsArray(): this is ValueArray {
        return this instanceof ValueArray;
    }
    public IsObject(): this is ValueObject {
        return this instanceof ValueObject;
    }

    public Format(): string {
        return String(this.value);
    }
}

/**
 * String
 */
class ValueString extends BaseValue {
    protected value: string = '';

    constructor(initValue?: string) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: string) {
        this.value = String(v);
        return this;
    }

    public Format(): string {
        return `"${this.value}"`;
    }
}

/**
 * Boolean
 */
class ValueBoolean extends BaseValue {
    protected value: boolean = false;

    constructor(initValue?: boolean) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: boolean) {
        this.value = v === true;
        return this;
    }
}

/**
 * Int
 */
class ValueInt extends BaseValue {
    protected value: number = 0;

    constructor(initValue?: number) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: number) {
        this.value = Math.floor(v);
        return this;
    }
}

/**
 * Double
 */
class ValueDouble extends BaseValue {
    protected value: number = 0;

    constructor(initValue?: number) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: number) {
        this.value = v;
        return this;
    }
}

/**
 * resource:""
 */
class ValueResource extends BaseValue {
    protected value: string = '';

    constructor(initValue?: string) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: string) {
        this.value = v;
        return this;
    }

    public Format(): string {
        return `resource:"${this.value}"`;
    }
}

/**
 * deferred_resource:""
 */
class ValueDeferredResource extends BaseValue {
    protected value: string = '';

    constructor(initValue?: string) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue() {
        return this.value;
    }

    public SetValue(v: string) {
        this.value = v;
        return this;
    }

    public Format(): string {
        return `deferred_resource:"${this.value}"`;
    }
}

/**
 * Array
 */
class ValueArray extends BaseValue {
    protected value: IKV3Value[] = [];

    constructor(initValue?: IKV3Value[]) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue(): Readonly<IKV3Value[]> {
        return this.value;
    }

    public SetValue(list: IKV3Value[]) {
        this.value = list.map((v) => v);
        return this;
    }

    public Append(v: IKV3Value) {
        this.value.push(v);
        return this;
    }

    public Insert(v: IKV3Value, index: number) {
        this.value.splice(index, 0, v);
        return this;
    }

    public Delete(v: IKV3Value) {
        const i = this.value.indexOf(v);
        if (i >= 0) {
            this.value.splice(i, 1);
        }
        return this;
    }

    public Format(tab: string = ''): string {
        let text = '';
        let oneLine = true;

        if (this.value.some((v) => v.IsArray() || v.IsObject())) {
            oneLine = false;
        } else {
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
        } else {
            text = `\n${tab}[`;
            text += this.value
                .map((v) => {
                    if (v.IsArray()) {
                        return v.Format(tab + '    ') + ',';
                    } else if (v.IsObject()) {
                        return v.Format(tab + '    ') + ',';
                    }
                    return '\n' + tab + '    ' + v.Format() + ',';
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
class ValueObject extends BaseValue {
    protected value: KeyValues3[] = [];

    constructor(initValue?: KeyValues3[]) {
        super();
        if (initValue) {
            this.SetValue(initValue);
        }
    }

    public GetValue(): Readonly<KeyValues3[]> {
        return this.value;
    }

    public SetValue(list: KeyValues3[]) {
        this.value = list.map((v) => v.Free());
        return this;
    }

    public Create(key: string, value: IKV3Value) {
        const kv = new KeyValues3(key, value);
        this.Append(kv);
        return kv;
    }

    public Append(v: KeyValues3) {
        this.value.push(v);
        return this;
    }

    public Insert(v: KeyValues3, index: number) {
        this.value.splice(index, 0, v);
        return this;
    }

    public Delete(v: string | KeyValues3) {
        let i = -1;
        if (typeof v === 'string') {
            i = this.value.findIndex((c) => c.Key === v);
        } else {
            i = this.value.findIndex((c) => c === v);
        }
        if (i >= 0) {
            this.value.splice(i, 1);
        }
        return this;
    }

    /**
     * Find a KeyValues3
     */
    public Find(
        callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
    ): KeyValues3 | undefined {
        for (const [i, kv] of this.value.entries()) {
            if (callback(kv, i, this) === true) {
                return kv;
            }
        }
    }

    /**
     * Find a KeyValues3
     */
    public FindKey(key: string): KeyValues3 | undefined {
        return this.Find((kv) => kv.Key === key);
    }

    /**
     * Find a KeyValues3
     */
    public FindAll(
        callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
    ): KeyValues3[] {
        const result: KeyValues3[] = [];
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
    public FindAllKey(key: string): KeyValues3[] {
        return this.FindAll((kv) => kv.Key === key);
    }

    public Format(tab: string = ''): string {
        let text = `\n${tab}{`;
        text += this.value.map((v) => '\n' + v.Format(tab + '    ')).join('');
        text += `\n${tab}}`;
        return text;
    }
}

const KeyUseQuoteTest = /^[\w\d_]+$/;

/**
 * https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3
 */
export default class KeyValues3 {
    public static String = ValueString;
    public static Boolean = ValueBoolean;
    public static Int = ValueInt;
    public static Double = ValueDouble;
    public static Resource = ValueResource;
    public static DeferredResource = ValueDeferredResource;
    public static Array = ValueArray;
    public static Object = ValueObject;

    /**
     * Comment
     */
    public Comments = new KeyValues3Comments();

    protected value: IKV3Value;

    protected header?: string;

    protected owner?: ValueObject;

    constructor(public Key: string, defaultValue: IKV3Value) {
        this.value = defaultValue;
        this.value.SetOwner(this);
    }

    public IsRoot() {
        return !!this.header;
    }

    public GetHeader() {
        return this.header;
    }

    public static CreateRoot() {
        const kv = new KeyValues3('', new ValueObject());
        kv.header = this.CommonHeader;
        return kv;
    }

    public static CommonHeader =
        '<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->';

    public GetValue() {
        return this.value;
    }

    public SetValue(v: IKV3Value) {
        if (this.IsRoot() && !v.IsObject()) {
            throw Error('The root node of KeyValues3 must be an object');
        }
        this.value = v;
    }

    public Free() {
        if (this.owner) {
            this.owner.Delete(this);
        }
        return this;
    }

    public CreateObjectValue(key: string, value: IKV3Value) {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.Create(key, value);
    }

    public AppendValue(value: IKV3Value) {
        if (!this.value.IsArray()) {
            throw Error('The KeyValues3 is not an array');
        }
        return this.value.Append(value);
    }

    public Find(
        callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
    ): KeyValues3 | undefined {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.Find(callback);
    }

    public FindKey(key: string): KeyValues3 | undefined {
        return this.Find((kv) => kv.Key === key);
    }

    public FindAll(
        callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
    ): KeyValues3[] {
        if (!this.value.IsObject()) {
            throw Error('The KeyValues3 is not an object');
        }
        return this.value.FindAll(callback);
    }

    public FindAllKey(key: string): KeyValues3[] {
        return this.FindAll((kv) => kv.Key === key);
    }

    public Format(tab: string = ''): string {
        let text = '';
        let prefix = '';
        const root = this.IsRoot();

        if (KeyUseQuoteTest.test(this.Key)) {
            prefix = `${tab}${this.Key} =`;
        } else {
            prefix = `${tab}"${this.Key}" =`;
        }

        if (root) {
            text += this.header + '\n';
        }

        if (this.value.IsArray()) {
            text += prefix;
            text += this.value.Format(tab);
        } else if (this.value.IsObject()) {
            if (root) {
                text += this.value.Format(tab).slice(1);
            } else {
                text += prefix;
                text += this.value.Format(tab);
            }
        } else {
            text += prefix + ` ${this.value.Format()}`;
        }

        return text;
    }

    public toString() {
        return this.Format();
    }
}
