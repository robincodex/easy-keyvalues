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
    let result = await kvLib.readFromFile('path/to/file');
    console.log(kvLib.FormatKeyValues(result));

    result = await kvLib.readFromString(kvText);
    console.log(kvLib.FormatKeyValues(result));
})();
```