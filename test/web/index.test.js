// @ts-check

const kvLib = require('../../dist/web/index');
const path = require('path');
const fs = require('fs');

test('[Web] KeyValues', async () => {
    const fileContentt = fs.readFileSync(path.join(__dirname, '../kv.txt'), { encoding: 'utf8' });
    const result = await kvLib.loadFromString(fileContentt);
    fs.writeFileSync('./__web_kv_test__.txt', kvLib.formatKeyValues(result), { encoding: 'utf8' });

    const expectValve = fs.readFileSync(path.join(__dirname, '../kv_expect.txt'), {
        encoding: 'utf8',
    });
    const formatResult = fs.readFileSync('./__web_kv_test__.txt', { encoding: 'utf8' });
    expect(formatResult === expectValve).toBeTruthy();
    fs.unlinkSync('./__web_kv_test__.txt');
});

test('[Web] KeyValues new key values', async () => {
    const result = [];
    result.push(
        kvLib.NewKeyValues('children', [
            kvLib.NewKeyValues('k01', '123'),
            kvLib.NewKeyValues('k02', 'www'),
            kvLib.NewKeyValues('k03', [kvLib.NewKeyValues('key', '123')]),
        ])
    );

    const formatResult = kvLib.formatKeyValues(result);
    const expectValve = `"children"
{
    "k01"        "123"
    "k02"        "www"
    "k03"
    {
        "key"        "123"
    }
}
`;
    expect(formatResult === expectValve).toBeTruthy();
});
