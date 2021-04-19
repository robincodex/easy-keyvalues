import { join } from 'path';
import {
    LoadKeyValues,
    SaveKeyValues,
    KeyValues,
    LoadKeyValuesSync,
    SaveKeyValuesSync,
} from '../dist/node';

function testKV(kv: KeyValues) {
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
    expect(kv.Find((kv) => kv.Key === '')?.Key).toBe(undefined);
    expect(kv.FindRecursive((kv) => kv.Key === '')?.Key).toBe(undefined);

    const findAll = kv.FindKey('Ha')?.FindAll((kv) => kv.Key === 'test');
    expect(findAll?.length).toBe(3);
    expect(findAll?.map((v) => v.Key)).toEqual(['test', 'test', 'test']);
    expect(findAll?.map((v) => v.GetValue())).toEqual(['123', '345', '789']);

    expect(kv.FindRecursive((kv) => kv.Key === 'BaseClass')?.GetValue()).toBe('ability_datadriven');

    expect(kv.FindRecursive((kv) => kv.Key === 'k3')?.GetValue()).toBe('v3');

    expect(kv.FindKey('DOTAAbilities')?.FindKey('BaseClass')?.GetValue()).toBe('ability_lua');

    expect(
        kv
            .FindKey('DOTAAbilities')
            ?.FindKey('building_system_active_preview')
            ?.FindKey('AbilityTextureName')
            ?.GetValue()
    ).toBe('abaddon/mistral_fiend_icons//abaddon_borrowed_time');

    expect(kv.FindKey('test')?.FindKey('children')?.FindKey('c2')?.GetValue()).toBe('2 \\"two\\"');

    expect(kv.FindKey('test')?.Comments?.GetComments()[0]).toBe('test object');

    expect(kv.FindKey('test')?.FindKey('children')?.Comments?.GetComments()).toEqual([
        'comment02',
        'comment03',
        'comment04',
    ]);

    expect(kv.FindKey('test')?.FindKey('children')?.Comments?.GetEndOfLineComment()).toBe(
        'this is children'
    );

    expect(kv.FindKey('test')?.FindKey('children')?.FindKey('c3')?.GetValue()).toBe(
        'sss\n    <br/>this is child\\n index 3\n    88'
    );
}

describe('KeyValues', () => {
    test('Check KeyValues.txt', async () => {
        const kv = await LoadKeyValues(join(__dirname, 'KeyValues.txt'));
        testKV(kv);
        await SaveKeyValues(join(__dirname, 'KeyValues.save.txt'), kv);
    });

    test('Check KeyValues.save.txt', async () => {
        const kv = LoadKeyValuesSync(join(__dirname, 'KeyValues.save.txt'));
        testKV(kv);
        SaveKeyValuesSync(join(__dirname, 'KeyValues.save.txt'), kv);
    });

    test('Check KeyValues Parse Error', async () => {
        KeyValues.Parse(`a 123\nb {c 123}`);
        try {
            KeyValues.Parse(`a{} 123`);
        } catch (e) {
            expect(e).toEqual(Error(`Not readable in line 1`));
        }
        try {
            KeyValues.Parse(`a[] 123`);
        } catch (e) {
            expect(e).toEqual(Error(`Not readable in line 1`));
        }
        try {
            KeyValues.Parse(`a" 123`);
        } catch (e) {
            expect(e).toEqual(Error(`Not readable in line 1`));
        }
        try {
            KeyValues.Parse(`/* a */`);
        } catch (e) {
            expect(e).toEqual(Error(`Line 1: not support multi-line comment`));
        }
    });

    test('Create/Append/Insert/Delete KeyValues', async () => {
        const root = KeyValues.CreateRoot();
        root.CreateChild('a', 'b');
        root.CreateChild('#base', 'file.kv');
        expect(root.toString()).toBe(`"a"    "b"\n#base    "file.kv"`);
        expect(root.GetParent()).toBe(undefined);
        expect(root.GetFirstChild()?.Key).toBe('a');

        root.CreateChild('c', [new KeyValues('d', 'a')])
            .Append(new KeyValues('d', 'a'))
            .Insert(new KeyValues('d', [new KeyValues('d', 'd')]), 0);
        expect(root.toString()).toBe(
            `"a"    "b"
#base    "file.kv"
"c"
{
    "d"
    {
        "d"    "d"
    }
    "d"    "a"
    "d"    "a"
}`
        );

        expect(root.Delete('c')?.toString()).toBe(`"c"
{
    "d"
    {
        "d"    "d"
    }
    "d"    "a"
    "d"    "a"
}`);
    });

    test('Check Comment', async () => {
        const testComment = new KeyValues('d', 'a');
        testComment.Comments.SetComments(['line1', 'line2']).SetEndOfLineComment('end');
        expect(testComment.toString()).toBe(`// line1
// line2
"d"    "a" // end`);

        try {
            testComment.Comments.AppendComment('a\nc');
        } catch (e) {
            expect(e).toEqual(Error('The comment only allowed one line'));
        }
        try {
            testComment.Comments.SetEndOfLineComment('a\nc');
        } catch (e) {
            expect(e).toEqual(Error('The comment only allowed one line'));
        }
        try {
            testComment.Comments.SetComments(['a\nc']);
        } catch (e) {
            expect(e).toEqual(Error('The comment only allowed one line'));
        }
    });

    test('Check KeyValues Error', () => {
        const kv = new KeyValues('a', []);
        expect(kv.GetValue()).toBe('');
        kv.SetValue('');
        expect(kv.GetChildren()).toEqual([]);

        try {
            kv.Append(new KeyValues(''));
        } catch (e) {
            expect(e).toEqual(Error(`The KeyValues [Key = a] does not have children`));
        }
        try {
            kv.Insert(new KeyValues(''), 0);
        } catch (e) {
            expect(e).toEqual(Error(`The KeyValues [Key = a] does not have children`));
        }
        expect(kv.Find((v) => true)).toBe(undefined);
        expect(kv.FindKey('')).toBe(undefined);
        expect(kv.FindRecursive((v) => true)).toBe(undefined);
        expect(kv.FindAll((v) => true)).toEqual([]);
        expect(kv.FindAllKeys('')).toEqual([]);
        expect(kv.Delete('')).toBe(undefined);

        try {
            const root = KeyValues.CreateRoot();
            // @ts-ignore
            root.value = '';
            // @ts-ignore
            delete root.children;
            root.Format();
        } catch (e) {
            expect(e).toEqual(Error(`The value of the root node kv must be an array`));
        }
        try {
            KeyValues.CreateRoot().SetValue('');
        } catch (e) {
            expect(e).toEqual(Error(`The value of the root node kv must be an array`));
        }

        try {
            const kv = new KeyValues('a', []);
            kv.Append(kv);
        } catch (e) {
            expect(e).toEqual(Error(`Append(): Can not append self`));
        }
        try {
            const kv = new KeyValues('a', []);
            kv.Insert(kv, 0);
        } catch (e) {
            expect(e).toEqual(Error(`Insert(): Can not insert self`));
        }
        try {
            const kv = new KeyValues('a', []);
            kv.SetValue([kv]);
        } catch (e) {
            expect(e).toEqual(Error(`SetValue(): The value can not includes self`));
        }
    });
});
