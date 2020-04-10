
const kvLib = require('../dist/index');
const path = require('path');

const kvText = `

// test object
"test"
{
    // comment01
    "key"   "value"

    // comment02
    // comment03
    // comment04
    "children"// this is children
    {
        "c1"    "1" // comment05
        "c2"    "2 \\"two\\""

    // comment07
        // comment08
        "c3"    "sss
    <br/>this is child\\n index 3
    88"
        "c4"   
        {
            "one"   "two"
        }
    }
}
`

;(async function() {
    console.log("--> read kv.txt")
    let result = await kvLib.readFromFile(path.join(__dirname, 'kv.txt'));
    console.log(kvLib.formatKeyValues(result));

    console.log("--> read from string")
    result = await kvLib.readFromString(kvText);
    console.log(kvLib.formatKeyValues(result));
})();