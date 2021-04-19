# easy-keyvalues

[![npm tag](https://img.shields.io/npm/v/easy-keyvalues/latest)](https://www.npmjs.com/package/easy-keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues-blue)](#keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues3-blue)](#keyvalues3)

写个库的原因是我想编辑 KV 文本，保存的时候可以格式化文本，并且保留注释，支持 KV 的`#base`等。

> 我完全重写了这个库，不与之前的版本兼容，所以版本从 1.0.0 开始。

## 安装

```shell
npm i easy-keyvalues
or
yarn add easy-keyvalues
```

# KeyValues

## 功能

-   保留注释
-   支持 nodejs 和浏览器
-   支持`#base`

## 导入

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
SaveKeyValuesSync(file: string, kv: KeyValues, encoding?: BufferEncoding): Promise<void>;
```

-   浏览器

```ts
import {
    KeyValues,
    LoadKeyValues,
} from 'easy-keyvalues/web';

LoadKeyValues(body: string): KeyValues;
```

## 使用

-   Node.js

```ts
// 解析KeyValues
const kv = await LoadKeyValues('/path/to/file.txt');
console.log(kv.toString());

// 解析utf16le格式的文本
const kv = await LoadKeyValues('/path/to/file.txt', 'utf16le');
console.log(kv.toString());
```

-   浏览器

```ts
// 解析KeyValues
const kv = LoadKeyValues(`
"DOTAAbilities"
{
    "Version"   "1"
}
`);
console.log(kv.toString());

// 解析utf16le格式的文本
// 推荐使用iconv-lite转化格式
const kv = LoadKeyValues(iconvLite.decode('some text of utf16le', 'utf16le'));
console.log(kv.toString());
```

### KeyValues 中的 value 和 children

| 属性     |    类型     | 描述                                                                                          |
| -------- | :---------: | --------------------------------------------------------------------------------------------- |
| value    |   string    | 它代表 KeyValues 的值，它始终是 string 类型，在解析过程中不会把数字字符串转化为`number`类型。 |
| children | KeyValues[] | 它代表 KeyValues 的子节点，也就代表这个 kv 是个 object，子节点是它的属性。                    |
| parent   |  KeyValues  | 它代表 KeyValues 所属的父节点，根节点没有父节点。                                             |

> 注意 value 和 children 是互斥的，两者存在其中一个，另一个则为`undefined`, 可通过`HasChildren()`判
> 断

相关方法：

```js
GetChildren(): Readonly<KeyValues[]> // 当 children 为 undefined 返回空数组
GetChildCount(): number
GetFirstChild(): KeyValues | undefined
GetLastChild(): KeyValues | undefined
GetValue(): string // 当 value 为 undefined 返回空字符串
HasChildren(): boolean
GetParent(): KeyValues | undefined
```

### 根节点

通过`KeyValues.Parse()`解析后返回的`KeyValues`是一个根节点，其方法`IsRoot()`将返回`true`，

并且强制拥有`children`。

### 创建

```js
// 创建根节点，这是一个静态方法
KeyValues.CreateRoot(): KeyValues

// 当 KeyValues 存在 children 的时候才能创建，否则会抛出错误
// 返回新建的 KeyValues
CreateChild(key: string, value: string | KeyValues[]): KeyValues

// 返回 KeyValues 本身，可以连续调用，如 SetValue('a').GetValue()
SetValue(v: string | KeyValues[]): this
```

范例

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

### 添加 / 删除

```js
// 当 KeyValues 存在 children 的时候才能调用，否则会抛出错误
// 添加 KeyValues 到 children 的末尾
Append(child: KeyValues): this

// 当 KeyValues 存在 children 的时候才能调用，否则会抛出错误
// 添加 KeyValues 到 children 的指定位置
Insert(child: KeyValues, index: number): this

// 从 children 删除指定的 key 或者 KeyValues
// 返回删除的 KeyValues
Delete(child: string | KeyValues): KeyValues | undefined

// 这个函数用于释放 KeyValues，解除节点之间的关联，
// 也就是从父节点删除自己，并且 parent 设置为 undefined
Free(): this
```

> 注意 SetValue, Append, Insert 的 KeyValues 将会改变 parent 的指向

范例

```js
const root = KeyValues.CreateRoot();
const kv = root.CreateChild('Table', []);
kv.Append(new KeyValues('Item', 'item_0001'));
kv.Append(new KeyValues('Item', 'item_0002'));

kv.Delete('Item')?.GetValue(); // item_0001
```

### 查找

```js
// 查找一个 KeyValues
Find(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues | undefined

// 查找多个 KeyValues
FindAll(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues[]

// 查找一个 KeyValues
FindKey(key: string): KeyValues | undefined

// 查找多个 KeyValues
FindAllKeys(...keys: string[]): KeyValues[]
```

范例

```js
// 例如上面的Table
kv.FindAllKeys('Item'); // [KeyValues('Item', 'item_0001'), KeyValues('Item', 'item_0002')]
```

# KeyValues3

## 功能

-   保留注释
-   支持 nodejs 和浏览器

## 导入

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
SaveKeyValues3Sync(file: string, kv: KeyValues3, encoding?: BufferEncoding): Promise<void>;
```

-   浏览器

```ts
import {
    KeyValues3,
    LoadKeyValues3,
} from 'easy-keyvalues/web';

LoadKeyValues3(body: string): KeyValues3;
```

## 使用

-   Node.js

```ts
// 解析KeyValues3
const kv3 = await LoadKeyValues3('/path/to/file.txt');
console.log(kv3.toString());

// 解析utf16le格式的文本
const kv3 = await LoadKeyValues3('/path/to/file.txt', 'utf16le');
console.log(kv3.toString());
```

-   浏览器

```ts
// 解析KeyValues3
const kv3 = LoadKeyValues3(`${KeyValues3.CommonHeader}
{
    "Version" = 1
}
`);
console.log(kv3.toString());
```
