# easy-keyvalues

[![CI](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/main.yml/badge.svg)](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/main.yml)
[![CodeQL](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/RobinCodeX/easy-keyvalues/actions/workflows/codeql-analysis.yml)
[![npm tag](https://img.shields.io/npm/v/easy-keyvalues/latest)](https://www.npmjs.com/package/easy-keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues-blue)](#keyvalues)
[![support tag](https://img.shields.io/badge/support-KeyValues3-blue)](#keyvalues3)

![coverage](./coverage/badge-statements.svg) ![coverage](./coverage/badge-branches.svg)
![coverage](./coverage/badge-functions.svg) ![coverage](./coverage/badge-lines.svg)

写个库的原因是我想编辑 KV 文本，保存的时候可以格式化文本，并且保留注释，支持自动载入 KV
的`#base`等。

> 我完全重写了这个库，不与之前的版本兼容，所以版本从 1.0.0 开始。

## 安装

```shell
npm i easy-keyvalues
or
yarn add easy-keyvalues
```

## UTF-8 BOM

遇到这种格式的文件现在会自动去掉BOM。

# KeyValues

## 功能

- 保留注释
- 支持 nodejs 和浏览器
- 支持自动载入`#base`

## 导入

- Node.js

```ts
import {
    KeyValues,
} from 'easy-keyvalues';

KeyValues.Load(file: string, encoding?: string): Promise<KeyValues>;
KeyValues.Save(): Promise<void>;
KeyValues.Save(otherFile: string, encoding?: string): Promise<void>;
```

## 使用

- Node.js

```ts
// 解析KeyValues
const kv = await KeyValues.Load('/path/to/file.txt', 'utf8');
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

### `#base`

这个库的目的是编辑 KV，所以加载`#base`之后不会将`#base`里面的所以 KeyValues 节点 合并到父节点，而是
依然保留`#base`这个 KeyValues 节点，它就是文件的根节点， 它的`children` 就是根节点的所有子节点。

范例

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
const root = await KeyValues.Load(join(__dirname, 'KeyValues.txt'));

// Get path
baseList[0].GetBaseFilePath(); // npc/file01.txt
baseList[0].filename; // {__dirname}/npc/file01.txt

// 调用`Save`会自动保存`#base`的文件
KeyValues.Save();

// 需要注意，如果指定了其它文件路径，base部分会根据相对路径一起创建。
KeyValues.Save(join(__dirname, 'otherPath/KeyValues.txt'));
```

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

// 遍历整个树
FindTraverse(
    callback: (kv: KeyValues, i: number, parent: KeyValues) => boolean
): KeyValues | undefined
```

范例

```js
// 例如上面的Table
kv.FindAllKeys('Item'); // [KeyValues('Item', 'item_0001'), KeyValues('Item', 'item_0002')]
```

### 转换成 Javascript 的 Object

方便转化成 JSON。

```js
// 返回一个Object
kv.toObject();
```

# KeyValues3

相比于 KeyValues，KeyValues3 有了多种数据类型，格式与 JSON 相似，相对的，代码也比 KeyValues 复杂很
多。

参考 https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/KeyValues3

## 功能

- 保留注释
- 支持 nodejs 和浏览器
- 友好的数据类型推断

## 导入

```ts
import {
    KeyValues3,
} from 'easy-keyvalues';

KeyValues3.Load(file: string, encoding?: string): Promise<KeyValues3>;
KeyValues3.Save(): Promise<void>;
KeyValues3.Save(otherFile: string, encoding?: string): Promise<void>;
```

## 使用

```ts
// 解析KeyValues3
const kv3 = await KeyValues3.Load('/path/to/file.txt', 'utf8');
console.log(kv3.toString());
```

### 数据类型

| KeyValues3 类型 | 对应的 Javascript 类型 | 描述                                                      |
| --------------- | ---------------------- | --------------------------------------------------------- |
| String          | string                 | KV3 支持多行字符串，用`"""`作为开头和结尾                 |
| Boolean         | boolean                | true 或者 false                                           |
| Int             | number                 | 整数                                                      |
| Double          | number                 | 格式化为字符串的时候使用`toFixed(6)`                      |
| Array           | Array                  | 数组，数据结构为`IKV3Value[]`                             |
| Object          | Object                 | 对象，数据结构为`KeyValues3[]`                            |
| Feature         | string                 | 例如`resource:"path/to/file.vpcf"` `soundevent:"Example"` |
| FeatureObject   | Object                 | 例如`subclass: {}`                                        |

> 注意解析 Int 和 Double 的时候，如果包含小数部分才会解析为 Double，否则都视为 Int

### 根节点

KeyValues3 的根节点有点特殊，它包含一个文件头，并且其值固定为 Object，基本格式：

```
<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
}
```

- 静态属性`KeyValues3.CommonHeader`是默认的文件头

- 静态方法`KeyValues3.CreateRoot(): KeyValues3`创建根节点

- 方法 `GetHeader(): string | undefined`获取文件头

- 方法 `IsRoot(): boolean`判断是否为根节点

### 创建

```js
// 当 KeyValues 的值为 Object 的时候才能调用，否则会抛出错误
// 创建 KeyValues3 到 Object
// 返回创建的 KeyValues3
CreateObjectValue(key: string, value: IKV3Value): KeyValues3
```

KeyValues3 的值都是个`class`，接口为`IKV3Value`，基类为`KV3BaseValue`

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
    IsFeature(): this is ValueFeature;
    IsFeatureObject(): this is ValueFeatureObject;
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
KeyValues3.Array( initValue?: IKV3Value[] )
KeyValues3.Object( initValue?: KeyValues3[] )
KeyValues3.Feature( feature: string, value?: string )
KeyValues3.FeatureObject( feature: string, initValue?: KeyValues3[] )
```

范例

```js
const root = KeyValues3.CreateRoot();
root.CreateObjectValue('a', KeyValues3.String('string'));
root.CreateObjectValue('b', KeyValues3.Boolean(false));
root.CreateObjectValue('c', KeyValues3.Int(0));
root.CreateObjectValue('d', KeyValues3.Double(0.0));
root.CreateObjectValue('e', KeyValues3.Array([]));
root.CreateObjectValue('f', KeyValues3.Object([]));
root.CreateObjectValue('g', KeyValues3.Feature('resource', 'path/to/file.vpcf'));
root.CreateObjectValue(
    'h',
    KeyValues3.FeatureObject('subclass', [new KeyValues3('child', KeyValues3.String('value'))]),
);

KeyValues3.Array([KeyValues3.String('one'), KeyValues3.String('two'), KeyValues3.String('three')]);

const obj = KeyValues3.Object([
    new KeyValues3('a', KeyValues3.String('one')),
    new KeyValues3('b', KeyValues3.Int(2)),
]);
obj.Create('c', KeyValues3.Boolean(true));
```

### 添加 / 删除

- KeyValues3 Object

```js
// 追加到 Object 末尾
Append(...values: KeyValues3[]): this
// 插入到 Object 指定位置
Insert(index: number, ...values: KeyValues3[]): this
// 删除子节点中的 KeyValues3，并返回删除的 KeyValues3
Delete(v: string | KeyValues3): KeyValues3
```

- KeyValues3 Array

```js
// 追加到 Array 末尾
Append(...values: IKV3Value[]): this
// 插入到 Array 指定位置
Insert(index: number, ...values: IKV3Value[]): this
// 删除子节点中的 IKV3Value
Delete(v: IKV3Value): this
```

### 查找

- KeyValues3 Object

```js
// 查找单个KeyValues3
Find(
    callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
): KeyValues3 | undefined

// 查找单个KeyValues3
FindKey(key: string): KeyValues3 | undefined

// 查找多个KeyValues3
FindAll(
    callback: (kv: KeyValues3, i: number, parent: ValueObject) => boolean
): KeyValues3[]

// 查找多个KeyValues3
FindAllKeys(...keys: string[]): KeyValues3[]
```

> 这些方法也存在 KeyValues3 方法中，当值为 Object 的时候可以调用

### 转换成 Javascript 的 Object

方便转化成 JSON。

```js
// 返回一个Object或者Array
kv3.toObject();
```

### 格式化

| KeyValues3 类型 | Javascript 的值                 | 格式化后                                    |
| --------------- | ------------------------------- | ------------------------------------------- |
| String          | `this is string`                | `"this is string"`                          |
| String          | `this is string \n second line` | """<br>this is string<br>second line<br>""" |
| Boolean         | true                            | true                                        |
| Int             | 5                               | 5                                           |
| Double          | 2.5                             | 2.500000                                    |

# 自定义适配器

该库已经为 nodejs 进行了适配，由于浏览器环境复杂，不提供浏览器的适配器，你可以参
考`src/node.ts`和`src/adapter.ts`进行适配。

## 关于 ID

`KeyValues`和`KeyValues3`都支持 ID 属性，ID 由适配器中的`createKeyValuesID()`提供，默认是返回空字符
串，如果需要这个 ID，只需要改写`createKeyValuesID()`即可，ID 存在的目的是为了支持类似于跨线程操作的
情景。

# License

[MIT License](./LICENSE)
