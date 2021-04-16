// @ts-check

const kvLib = require('../');
const path = require('path');
const fs = require('fs');

test('KeyValues', async () => {
    const result = await kvLib.loadFromFile(path.join(__dirname, 'kv.txt'));
    await kvLib.writeFile('./__kv_test__.txt', result);

    const expectValve = fs.readFileSync(path.join(__dirname, 'kv_expect.txt'), {
        encoding: 'utf8',
    });
    const formatResult = fs.readFileSync('./__kv_test__.txt', { encoding: 'utf8' });
    expect(formatResult === expectValve).toBeTruthy();
    fs.unlinkSync('./__kv_test__.txt');
});

test('KeyValues new key values', async () => {
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
