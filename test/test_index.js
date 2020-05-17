
const kvLib = require('../');
const kv3Lib = require('../dist/kv3');
const path = require('path');
const fs = require('fs');

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

    "test" 
    {
        "three"   "two"
    }
}
`;

const kvText2 = `
"Ha"
{
	test	"123"
    01haha	false
    t1
    {
        asd 456
        ggg 
        {
            hjjj sss
        }
    }
}
`;

const kv3Text = `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
    a05=789
    bb = ""
    cc = [123, "", {a=""}, """asd
First line of a multi-line string literal.
Second line of a multi-line string literal.
"""]
    "a.b" = 123
	array.Value =
	[
		1,
        2,
        "",
        {
            a = 123
            b = "456"
            c = -1.5
            g = {a=123 b=["456","789", true, {b=456}]}
            t = [
                3,
                6,
            ]
        }
	]
	objectValue =
	{
		n = 5
        s = "foo"
        h = ["a", 456]
        g = 
        {
            b = 123
        }
        j = {a=123 b=["456","789", true, {b=456}]}
        i = [[123],[456,789,false]]
	}
}
`;

function printKV3( obj ) {
    console.log(JSON.stringify(obj, (key, value) => {
        if (key === "Type" && typeof value === "number") {
            return kv3Lib.KeyValues3Type[value];
        }
        return value;
    }, '    '));
}

function printKV( obj ) {
    console.log(JSON.stringify(obj, (key, value) => {
        if (key === "Type" && typeof value === "number") {
            return kvLib.KeyValuesType[value];
        }
        return value;
    }, '    '));
}

;(async function() {
    console.log("--> load kv.txt")
    let result = await kvLib.loadFromFile(path.join(__dirname, 'kv.txt'));
    console.log(kvLib.formatKeyValues(result));

    console.log("--> load from string kvText")
    result = await kvLib.loadFromString(kvText);
    console.log(kvLib.formatKeyValues(result));
    await kvLib.writeFile(path.join(__dirname, 'kv_w.txt'), result)

    console.log("--> load from string kvText2")
    result = await kvLib.loadFromString(kvText2);
    console.log(kvLib.formatKeyValues(result));

    console.log("--> load from kv3 string")
    console.log(kv3Lib.formatKeyValues(await kv3Lib.loadFromFile(path.join(__dirname, 'kv3.txt'))));
    console.log(kv3Lib.formatKeyValues(await kv3Lib.loadFromString(kv3Text)));
    await kv3Lib.writeFile(path.join(__dirname, 'kv3_w.txt'), await kv3Lib.loadFromString(kv3Text))

    const testNewKV = [];
    testNewKV.push(kv3Lib.NewKeyValuesObject("children", [
        kv3Lib.NewKeyValue("k01", "str"),
        kv3Lib.NewKeyValueInt("k02", 123),
        kv3Lib.NewKeyValueDouble("k03", 123.4),
        kv3Lib.NewKeyValueBoolean("k04", true),
        kv3Lib.NewKeyValuesArray("k05", [
            kv3Lib.NewKeyValue("", "str"),
            kv3Lib.NewKeyValueInt("", 123),
        ]),
    ]));
    printKV3(testNewKV);
})();