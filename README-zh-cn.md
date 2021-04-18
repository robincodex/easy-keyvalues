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

```typescript
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

```typescript
import {
    KeyValues,
    LoadKeyValues,
} from 'easy-keyvalues/web';

LoadKeyValues(body: string): KeyValues;
```

## 使用

-   Node.js

```typescript
// 解析KeyValues
const kv = await LoadKeyValues('/path/to/file.txt');
console.log(kv.toString());

// 解析utf16le格式的文本
const kv = await LoadKeyValues('/path/to/file.txt', 'utf16le');
console.log(kv.toString());
```

-   浏览器

```typescript
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

# KeyValues3

## 功能

-   保留注释
-   支持 nodejs 和浏览器

## 导入

-   Node.js

```typescript
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

```typescript
import {
    KeyValues3,
    LoadKeyValues3,
} from 'easy-keyvalues/web';

LoadKeyValues3(body: string): KeyValues3;
```

## 使用

-   Node.js

```typescript
// 解析KeyValues3
const kv3 = await LoadKeyValues3('/path/to/file.txt');
console.log(kv3.toString());

// 解析utf16le格式的文本
const kv3 = await LoadKeyValues3('/path/to/file.txt', 'utf16le');
console.log(kv3.toString());
```

-   浏览器

```typescript
// 解析KeyValues3
const kv3 = LoadKeyValues3(`${KeyValues3.CommonHeader}
{
    "Version" = 1
}
`);
console.log(kv3.toString());
```
