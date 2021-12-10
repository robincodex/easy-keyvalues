# easy-keyvalues

[![CI](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/main.yml/badge.svg)](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/main.yml)
[![CodeQL](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/codeql-analysis.yml)
[![npm tag](https://img.shields.io/npm/v/easy-keyvalues/latest)](https://www.npmjs.com/package/easy-keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues-blue)](#keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues3-blue)](#keyvalues3)

![coverage](https://raw.githubusercontent.com/RobinCodeX/easy-keyvalues/master/coverage/badge-statements.svg)
![coverage](https://raw.githubusercontent.com/RobinCodeX/easy-keyvalues/master/coverage/badge-branches.svg)
![coverage](https://raw.githubusercontent.com/RobinCodeX/easy-keyvalues/master/coverage/badge-functions.svg)
![coverage](https://raw.githubusercontent.com/RobinCodeX/easy-keyvalues/master/coverage/badge-lines.svg)

The reason for writing a library is that I want to edit KeyValues text, format the text when saving,
and keep the comments, support `#base` on KeyValues, etc.

[简体中文](https://github.com/RobinCodeX/easy-keyvalues/blob/master/README-zh-cn.md)

> I completely rewrote the library to not be compatible with previous versions, so the version
> starts from 1.0.0.

## Installation

```shell
npm i easy-keyvalues
or
yarn add easy-keyvalues
```

## UTF-8 BOM

This library will get errors when encountering `UTF-8 BOM` files, because the first char code of
`UTF-8 BOM` files will be 65279, which causes parsing errors. So you need to use a library such as
[iconv-lite](https://github.com/ashtuchkin/iconv-lite) to remove the `BOM` in advance.

```js
const buf = readFileSync(join(__dirname, 'chat_english.txt'));
const text = iconvLite.decode(buf, 'utf8');
const kv = KeyValues.Parse(text);
```

## About ID

Both `KeyValues` and `KeyValues3` support the ID property, which is empty by default. ID is
generated from [nanoid](https://github.com/ai/nanoid). The ID exists to support scenarios like
cross-threaded operations, and is turned on if it is needed:

```js
// KeyValues
KeyValues.SetIDEnabled(true);

// KeyValues3
KeyValues3.SetIDEnabled(true);

// Find child using ID
kv.FindID('<nanoid>');
kv.FindIDTraverse('<nanoid>');
kv3.FindID('<nanoid>');
kv3.FindIDTraverse('<nanoid>');
```

# KeyValues

## Features

-   Retain comments
-   Support Node.js and browser
-   Support `#base`

## Import

-   Node.js

```ts
import {
    KeyValues,
    LoadKeyValues,
    SaveKeyValues,
    LoadKeyValuesSync,
    SaveKeyValuesSync,
} from 'easy-keyvalues';

LoadKeyValues(file: string, encoding?: BufferEncoding): Promise<KeyValues>;
LoadKeyValuesSync(file: string, encoding?: BufferEncoding): KeyValues;
SaveKeyValues(file: string, kv: KeyValues, encoding?: BufferEncoding): Promise<void>;
SaveKeyValuesSync(file: string, kv: KeyValues, encoding?: BufferEncoding): void;
```

-   Browser

```ts
import {
    KeyValues,
    LoadKeyValues,
} from 'easy-keyvalues/web';

LoadKeyValues(url: string, config?: AxiosRequestConfig): Promise<KeyValues>;
```

## Usages

-   Node.js

```ts
// Parse KeyValues text
const kv = await LoadKeyValues('/path/to/file.txt');
console.log(kv.toString());

// Parse KeyValues text for utf16le
const kv = await LoadKeyValues('/path/to/file.txt', 'utf16le');
console.log(kv.toString());
```

-   Browser

```ts
// Parse KeyValues text
const kv = await LoadKeyValues('http://localhost/file.txt');
console.log(kv.toString());

// Parse KeyValues text for utf16le
// Suggest using iconv-lite decode text
const kv = LoadKeyValues(iconvLite.decode('some text of utf16le', 'utf16le'));
console.log(kv.toString());
```

### KeyValues's `value` and `children`

| Property |    Type     | Description                                                                                                                           |
| -------- | :---------: | ------------------------------------------------------------------------------------------------------------------------------------- |
| value    |   string    | It represents the value of KeyValues, which is always of type string and does not convert numeric strings to `number` during parsing. |
| children | KeyValues[] | It represents the children of KeyValues, which means that this kv is an object and the children are its properties.                   |
| parent   |  KeyValues  | It represents the parent node to which the KeyValues belong; the root node has no parent.                                             |

> Note that value and children are mutually exclusive, one of them exists and the other is
> undefined, which can be determined by HasChildren()

Related Methods：

```js
GetChildren(): Readonly<KeyValues[]> // When children is undefined return empty array
GetChildCount(): number
GetFirstChild(): KeyValues | undefined
GetLastChild(): KeyValues | undefined
GetValue(): string // When value is undefined return empty string
HasChildren(): boolean
GetParent(): KeyValues | undefined
```

### Root Node

The `KeyValues` returned after parsing by `KeyValues.Parse()` is a root node, whose method
`IsRoot()` will return `true` and is forced to have `children`.

### `#base`

The purpose of this library is to edit the KV, so after loading `#base` it does not merge all the
KeyValues nodes in `#base` into the parent node, but keeps the KeyValues node `#base`, which is the
root node of the file, and its `children` are all the children of the root node.

```js
import {
    KeyValues,
    AutoLoadKeyValuesBase,
    AutoLoadKeyValuesBaseSync,
} from 'easy-keyvalues';

AutoLoadKeyValuesBase(rootNode: KeyValues,rootDir: string): Promise<KeyValues[]>
AutoLoadKeyValuesBaseSync(rootNode: KeyValues, rootDir: string): KeyValues[]
```

Example

```js
/*
KeyValues.txt

#base "npc/file01.txt"
#base "npc/file02.txt"

"DOTAAbilities"
{
    "ability01"
    {
        "BaseClass"         "ability_datadriven"
        "AbilityBehavior"   "DOTA_ABILITY_BEHAVIOR_POINT"
    }
}
*/
const root = await LoadKeyValues(join(__dirname, 'KeyValues.txt'));
const baseList = await AutoLoadKeyValuesBase(root, __dirname);

// Get path
baseList[0].GetBaseFilePath(); // npc/file01.txt
baseList[0].GetBaseAbsoluteFilePath(); // join(__dirname, 'KeyValues.txt')

// Calling `SaveKeyValues` and `SaveKeyValuesSync` after loading `#base` will automatically save the `#base` file
SaveKeyValuesSync(join(__dirname, 'KeyValues.txt'), root);
```

### Create

```js
// Create the root node, which is a static method
KeyValues.CreateRoot(): KeyValues

// Only create KeyValues when children exist, otherwise an error will be thrown
// Return new KeyValues
CreateChild(key: string, value: string | KeyValues[]): KeyValues

// Returns self, such as SetValue('a').GetValue()
SetValue(v: string | KeyValues[]): this
```

Example

```js
/*
"Table"
{
    "Item"  "item_0001"
    "Item"  "item_0002"
}
*/

const root = KeyValues.CreateRoot();
const kv = root.CreateChild('Table', []);
kv.CreateChild('Item', 'item_0001');
kv.CreateChild('Item', 'item_0002');

// or

root.CreateChild('Table', [new KeyValues('Item', 'item_0001'), new KeyValues('Item', 'item_0002')]);

// or

kv.SetValue([new KeyValues('Item', 'item_0001'), new KeyValues('Item', 'item_0002')]);
```

### Add / Delete

```js
// Called only when children exist in KeyValues, otherwise an error will be thrown
// Add KeyValues to the end of children
Append(child: KeyValues): this

// Called only when children exist in KeyValues, otherwise an error will be thrown
// Add KeyValues to the specified location of children
Insert(child: KeyValues, index: number): this

// Delete the specified key or KeyValues from children
// Return deleted KeyValues
Delete(child: string | KeyValues): KeyValues | undefined

// This function is used to release the KeyValues and unlink the nodes,
// i.e. remove self from the parent node, and set the parent to undefined
Free(): this
```

> Note that the KeyValues of SetValue, Append, Insert will change the parent

Example

```js
const root = KeyValues.CreateRoot();
const kv = root.CreateChild('Table', []);
kv.Append(new KeyValues('Item', 'item_0001'));
kv.Append(new KeyValues('Item', 'item_0002'));

kv.Delete('Item')?.GetValue(); // item_0001
```

### Find

```js
// Find a KeyValues
Find(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues | undefined

// Find multiple KeyValues
FindAll(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues[]

// Find a KeyValues
FindKey(key: string): KeyValues | undefined

// Find multiple KeyValues
FindAllKeys(...keys: string[]): KeyValues[]

// Traversing the KeyValues tree
FindTraverse(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues | undefined
```

Example

```js
// For example, the above Table
kv.FindAllKeys('Item'); // [KeyValues('Item', 'item_0001'), KeyValues('Item', 'item_0002')]
```

### Convert to Javascript Object

Easy to convert to JSON.

```js
// Return an object
kv.toObject();
```

# KeyValues3

Compared to KeyValues, KeyValues3 has multiple data types, a format similar to JSON, and relatively
more complex code than KeyValues. The code is also much more complex than KeyValues.

Reference https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3

## Features

-   Retain comments
-   Support Node.js and browser
-   Friendly data type inference

## Import

-   Node.js

```ts
import {
    KeyValues3,
    LoadKeyValues3,
    SaveKeyValues3,
    LoadKeyValues3Sync,
    SaveKeyValues3Sync,
} from 'easy-keyvalues';

LoadKeyValues3(file: string, encoding?: BufferEncoding): Promise<KeyValues3>;
LoadKeyValues3Sync(file: string, encoding?: BufferEncoding): KeyValues3;
SaveKeyValues3(file: string, kv: KeyValues3, encoding?: BufferEncoding): Promise<void>;
SaveKeyValues3Sync(file: string, kv: KeyValues3, encoding?: BufferEncoding): void;
```

-   Browser

```ts
import {
    KeyValues3,
    LoadKeyValues3,
} from 'easy-keyvalues/web';

LoadKeyValues3(url: string, config?: AxiosRequestConfig): Promise<KeyValues3>;
```

## Usages

-   Node.js

```ts
// Parse KeyValues3
const kv3 = await LoadKeyValues3('/path/to/file.txt');
console.log(kv3.toString());

// Parse utf16le
const kv3 = await LoadKeyValues3('/path/to/file.txt', 'utf16le');
console.log(kv3.toString());
```

-   Browser

```ts
// Parse KeyValues3
const kv3 = await LoadKeyValues3('http://localhost/file.txt');
console.log(kv3.toString());
```

### Data Types

| KeyValues3 Type | Javascript Type | Description                                                         |
| --------------- | --------------- | ------------------------------------------------------------------- |
| String          | string          | KV3 supports multi-line strings with `"""` as the beginning and end |
| Boolean         | boolean         | true or false                                                       |
| Int             | number          | integer                                                             |
| Double          | number          | When formatting as a string use`toFixed(6)`                         |
| Resource        | string          | Represents the value of `{path}` in `resource:"{path}"`             |
| Array           | Array           | Array，Type:`IKV3Value[]`                                           |
| Object          | Object          | Object，Type:`KeyValues3[]`                                         |

> Note that when parsing Int and Double, they are only parsed as Double if they contain a fractional
> part, otherwise they are treated as Int

### Root Node

The root node of KeyValues3 is a bit special in that it contains a file header and its value is
fixed to Object, with the following basic format:

```
<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
}
```

-   Static property `KeyValues3.CommonHeader` is default header

-   Static method `KeyValues3.CreateRoot(): KeyValues3` Create root node

-   Method `GetHeader(): string | undefined` Get file header

-   Method `IsRoot(): boolean` Determine if it is the root node

### Create

```js
// Called only when the value of KeyValues is Object, otherwise an error is thrown
// Create KeyValues3 to Object
// Return created KeyValues3
CreateObjectValue(key: string, value: IKV3Value): KeyValues3
```

KeyValues3 values are a `class`, the interface is `IKV3Value` and the base class is `KV3BaseValue`.

```ts
interface IKV3Value {
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
```

```js
KeyValues3.String( initValue?: string )
KeyValues3.Boolean( initValue?: boolean )
KeyValues3.Int( initValue?: number )
KeyValues3.Double( initValue?: number )
KeyValues3.Resource( initValue?: string )
KeyValues3.Array( initValue?: IKV3Value[] )
KeyValues3.Object( initValue?: KeyValues3[] )
```

Example

```js
const root = KeyValues3.CreateRoot();
root.CreateObjectValue('a', KeyValues3.String('string'));
root.CreateObjectValue('b', KeyValues3.Boolean(false));
root.CreateObjectValue('c', KeyValues3.Int(0));
root.CreateObjectValue('d', KeyValues3.Double(0.0));
root.CreateObjectValue('e', KeyValues3.Resource('path/to/file.vpcf'));
root.CreateObjectValue('f', KeyValues3.Array([]));
root.CreateObjectValue('g', KeyValues3.Object([]));

KeyValues3.Array([KeyValues3.String('one'), KeyValues3.String('two'), KeyValues3.String('three')]);

const obj = KeyValues3.Object([
    new KeyValues3('a', KeyValues3.String('one')),
    new KeyValues3('b', KeyValues3.Int(2)),
]);
obj.Create('c', KeyValues3.Boolean(true));
```

### Add / Delete

-   KeyValues3 Object

```js
// Append to the end of Object
Append(...values: KeyValues3[]): this
// Insert into Object at the specified location
Insert(index: number, ...values: KeyValues3[]): this
// Deletes KeyValues3 from the child node and returns the deleted KeyValues3
Delete(v: string | KeyValues3): KeyValues3
```

-   KeyValues3 Array

```js
// Append to the end of Array
Append(...values: IKV3Value[]): this
// Insert into Array at the specified location
Insert(index: number, ...values: IKV3Value[]): this
// Delete the IKV3Value in the child node
Delete(v: IKV3Value): this
```

### Find

-   KeyValues3 Object

```js
// Find a KeyValues3
Find(
    callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
): KeyValues3 | undefined

// Find a KeyValues3
FindKey(key: string): KeyValues3 | undefined

// Find multiple KeyValues3
FindAll(
    callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
): KeyValues3[]

// Find multiple KeyValues3
FindAllKeys(...keys: string[]): KeyValues3[]
```

> These methods are also present in the KeyValues3 method and can be called when the value is an
> Object

### Convert to Javascript Object

Easy to convert to JSON.

```js
// Return an object or array
kv3.toObject();
```

### Format

| KeyValues3 Type | Javascript Value                | Format after                                |
| --------------- | ------------------------------- | ------------------------------------------- |
| String          | `this is string`                | `"this is string"`                          |
| String          | `this is string \n second line` | """<br>this is string<br>second line<br>""" |
| Boolean         | true                            | true                                        |
| Int             | 5                               | 5                                           |
| Double          | 2.5                             | 2.500000                                    |
| Resource        | `path/to/file.vpcf`             | `resource:"path/to/file.vpcf"`              |

# License

[MIT License](./LICENSE)
