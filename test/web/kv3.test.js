// @ts-check

const kv3Lib = require('../../dist/web/kv3');
const path = require('path');
const fs = require('fs');

test('KeyValues3', async () => {
    const fileContentt = fs.readFileSync(path.join(__dirname, '../kv3.txt'), {encoding: 'utf8'})
    const result = await kv3Lib.loadFromString(fileContentt)
    fs.writeFileSync("./__web_kv3_test__.txt", kv3Lib.formatKeyValues(result), {encoding: 'utf8'});

    const expectValve = fs.readFileSync(path.join(__dirname, '../kv3_expect.txt'), {encoding: 'utf8'})
    const formatResult = fs.readFileSync("./__web_kv3_test__.txt", {encoding: 'utf8'});
    expect(formatResult === expectValve).toBeTruthy();
    fs.unlinkSync("./__web_kv3_test__.txt")
});

test('KeyValues3 new key values', async () => {
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

    const expectValve = `children = 
{
    k01 = "str"
    k02 = 123
    k03 = 123.4
    k04 = true
    k05 = 
    [
        "str",
        123,
    ]
}
`
    const formatResult = kv3Lib.formatKeyValues(testNewKV);
    expect(formatResult === expectValve).toBeTruthy();
});