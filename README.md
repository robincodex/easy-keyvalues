# easy-keyvalues
[![npm tag](https://img.shields.io/npm/v/easy-keyvalues/latest)](https://www.npmjs.com/package/easy-keyvalues)
![support tag](https://img.shields.io/badge/support-KeyValues-blue)
![support tag](https://img.shields.io/badge/support-KeyValues3-blue)

Parse Valve KeyValues Format to easy use for nodejs

# KeyValues
```js
const kvLib = require('easy-keyvalues');

const kvText = `
// test object
"test"
{
    // comment01
    "key"   "value"
}
`
function printKV( obj ) {
    console.log(JSON.stringify(obj, (key, value) => {
        if (key === "Type" && typeof value === "number") {
            return kvLib.KeyValuesType[value];
        }
        return value;
    }, '    '));
}

;(async function() {
    let result = await kvLib.loadFromFile('path/to/file');
    console.log(kvLib.formatKeyValues(result));

    printKV(result)
    /*
    [
        {
            "Type": "Comment",
            "Key": "",
            "Value": " test object"
        },
        {
            "Type": "KeyValue",
            "Key": "test",
            "Value": [
                {
                    "Type": "Comment",
                    "Key": "",
                    "Value": " comment01"
                },
                {
                    "Type": "KeyValue",
                    "Key": "key",
                    "Value": "value"
                }
            ]
        }
    ]
    */

    result = await kvLib.loadFromString(kvText);
    console.log(kvLib.formatKeyValues(result));
    await kvLib.writeFile(path.join(__dirname, 'kv.txt'), result)

    // Find kv, using Array.find()
    result.find((v) => v.Key === "key")

    // Remove a kv, using Array.filter()
    result = result.filter((v) => v.Key !== "key")

    // insert some kv, using Array.push()
    result.push(kvLib.NewKeyValues("children", [
        kvLib.NewKeyValues("k01", "123"),
        kvLib.NewKeyValues("k02", "www"),
        kvLib.NewKeyValues("k03", [kvLib.NewKeyValues("key", "123")]),
    ])
})();
```

# KeyValues3

> :warning:Since the format of KeyValues3 is more complicated than KeyValues, it may parse errors.

```js
const kv3Lib = require('easy-keyvalues/dist/kv3');

const kv3Text = `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
    a = 789
    b = false
    arrayValue =
    [
        1,
        2,
    ]
    objectValue =
    {
        n = 5
        s = "foo"
    }
}
`
function printKV3( obj ) {
    console.log(JSON.stringify(obj, (key, value) => {
        if (key === "Type" && typeof value === "number") {
            return kv3Lib.KeyValues3Type[value];
        }
        return value;
    }, '    '));
}

;(async function() {
    printKV3( await kv3Lib.loadFromString(kv3Text) )
    /*
    Result:
    [
        {
            "Type": "Header",
            "Key": "",
            "Value": "<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->"
        },
        {
            "Type": "KeyValue_Object",
            "Key": "",
            "Value": [
                {
                    "Type": "KeyValue_Int",
                    "Key": "a",
                    "Value": "789"
                },
                {
                    "Type": "KeyValue_Boolean",
                    "Key": "b",
                    "Value": "false"
                },
                {
                    "Type": "KeyValue_Array",
                    "Key": "arrayValue",
                    "Value": [
                        {
                            "Type": "KeyValue_Int",
                            "Key": "",
                            "Value": "1"
                        },
                        {
                            "Type": "KeyValue_Int",
                            "Key": "",
                            "Value": "2"
                        }
                    ]
                },
                {
                    "Type": "KeyValue_Object",
                    "Key": "objectValue",
                    "Value": [
                        {
                            "Type": "KeyValue_Int",
                            "Key": "n",
                            "Value": "5"
                        },
                        {
                            "Type": "KeyValue_String",
                            "Key": "s",
                            "Value": "foo"
                        }
                    ]
                }
            ]
        }
    ]
    */

    const result = await kv3Lib.loadFromString(kv3Text);
    console.log( kv3Lib.formatKeyValues( result ) );

    // Find kv, using Array.find()
    result.find((v) => v.Key === "arrayValue")

    // Remove a kv, using Array.filter()
    result = result.filter((v) => v.Key !== "b")

    // insert some kv, using Array.push()
    result.push(kv3Lib.NewKeyValuesObject("children", [
        kv3Lib.NewKeyValue("k01", "str"),
        kv3Lib.NewKeyValueInt("k02", 123),
        kv3Lib.NewKeyValueDouble("k03", 123.4),
        kv3Lib.NewKeyValueBoolean("k04", true),
        kv3Lib.NewKeyValuesArray("k05", [
            kv3Lib.NewKeyValue("", "str"),
            kv3Lib.NewKeyValueInt("", 123),
        ]),
    ])
})();
```