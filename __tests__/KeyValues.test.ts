import { join } from 'path';
import { LoadKeyValues, SaveKeyValues } from '../';

test('KeyValues', async () => {
    const kv = await LoadKeyValues(join(__dirname, 'KeyValues.txt'));
    expect(kv.GetChildCount()).toBe(6);
    expect(kv.GetChildren().map((v) => v.Key)).toEqual([
        '#base',
        '#base',
        '#base',
        'DOTAAbilities',
        'Ha',
        'test',
    ]);
    expect(kv.Find((kv) => kv.Key === 'Ha')?.Key).toBe('Ha');
    expect(kv.FindRecursive((kv) => kv.Key === 'BaseClass')?.GetValue()).toBe(
        'ability_datadriven'
    );
    expect(kv.FindRecursive((kv) => kv.Key === 'k3')?.GetValue()).toBe('v3');
    expect(kv.FindKey('DOTAAbilities')?.FindKey('BaseClass')?.GetValue()).toBe(
        'ability_lua'
    );
    expect(kv.FindKey('test')?.FindKey('children')?.FindKey('c2')?.GetValue()).toBe(
        '2 \\"two\\"'
    );
    expect(kv.FindKey('test')?.Comments?.GetComments()[0]).toBe('test object');

    await SaveKeyValues(join(__dirname, 'KeyValues.save.txt'), kv);
});
