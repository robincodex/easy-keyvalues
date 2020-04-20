# easy-keyvalues
Parse Valve KeyValues Format to easy use for nodejs

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

;(async function() {
    let result = await kvLib.loadFromFile('path/to/file');
    console.log(kvLib.formatKeyValues(result));

    result = await kvLib.loadFromString(kvText);
    console.log(kvLib.formatKeyValues(result));
    await kvLib.writeFile(path.join(__dirname, 'kv.txt'), result)
})();
```

# KeyValues3

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
        h = ["a", 456]
    }
}
`

;(async function() {
    function printKV3( obj ) {
        console.log(JSON.stringify(obj, (key, value) => {
            if (key === "Type" && typeof value === "number") {
                return kv3Lib.KeyValues3Type[value];
            }
            return value;
        }, '    '));
    }

    printKV3( await kv3Lib.loadFromString(kv3Text) )
    console.log( kv3Lib.formatKeyValues( await kv3Lib.loadFromString(kv3Text) ) );
})();
```