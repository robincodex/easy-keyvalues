import { readFile, readFileSync } from 'fs';
import { join } from 'path';
import {
    LoadKeyValues,
    SaveKeyValues,
    KeyValues,
    LoadKeyValuesSync,
    SaveKeyValuesSync,
    AutoLoadKeyValuesBase,
    AutoLoadKeyValuesBaseSync,
} from '../src/node';
import * as iconv from 'iconv-lite';

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
    expect(kv.FindTraverse((kv) => kv.Key === '')?.Key).toBe(undefined);

    const findAll = kv.FindKey('Ha')?.FindAll((kv) => kv.Key === 'test');
    expect(findAll?.length).toBe(3);
    expect(findAll?.map((v) => v.Key)).toEqual(['test', 'test', 'test']);
    expect(findAll?.map((v) => v.GetValue())).toEqual(['123', '345', '789']);

    expect(kv.FindTraverse((kv) => kv.Key === 'BaseClass')?.GetValue()).toBe('ability_datadriven');

    expect(kv.FindTraverse((kv) => kv.Key === 'k3')?.GetValue()).toBe('v3');

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

    test('Check chat_english.txt', async () => {
        const buf = readFileSync(join(__dirname, 'chat_english.txt'));
        const text = iconv.decode(buf, 'utf8');
        const kv = KeyValues.Parse(text);
        const tokens = kv.FindKey('lang')?.FindKey('Tokens');
        expect(!tokens).toBe(false);
        expect(tokens?.GetChildCount()).toBe(11);
    });

    test('Check gameui_english.txt', async () => {
        const buf = readFileSync(join(__dirname, 'gameui_english.txt'));
        const text = iconv.decode(buf, 'utf8');
        const kv = KeyValues.Parse(text);
        const tokens = kv.FindKey('lang')?.FindKey('Tokens');
        expect(!tokens).toBe(false);
        expect(tokens?.GetChildCount()).toBe(688);
        expect(tokens?.FindKey('GameUI_JoystickMoveLookSticks')?.Flags).toBe('$WIN32');
        expect(
            tokens
                ?.FindAllKeys('GameUI_JoystickMoveLookSticks')
                ?.map((v) => v.Flags)
                .join(',')
        ).toBe('$WIN32,$X360');
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
        expect(root.GetFirstChild()?.GetParent()).toBe(root);

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

        const cloneRoot = root.Clone();
        expect(cloneRoot === root).toBe(false);
        expect(cloneRoot.toString()).toBe(root.toString());

        cloneRoot.GetFirstChild()!.Key = 'b';
        cloneRoot.FindKey('c')?.FindKey('d')?.Append(new KeyValues('c', 'c'));
        expect(root.GetFirstChild()!.Key).toBe('a');
        expect(cloneRoot.FindKey('c')?.FindKey('d')?.FindKey('c')?.GetValue()).toBe('c');
        expect(root.FindKey('c')?.FindKey('d')?.FindKey('c')).toBe(undefined);

        const c = root.Delete('c');
        expect(c?.toString()).toBe(`"c"
{
    "d"
    {
        "d"    "d"
    }
    "d"    "a"
    "d"    "a"
}`);
        expect(c?.GetParent()).toBe(undefined);
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
        expect(kv.FindTraverse((v) => true)).toBe(undefined);
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

    test('Check KeyValues #base', async () => {
        const root = await LoadKeyValues(join(__dirname, 'KeyValues.base.txt'));
        await AutoLoadKeyValuesBase(root, __dirname);
        expect(
            root.FindKey('DOTAAbilities')?.FindKey('ability01')?.FindKey('BaseClass')?.GetValue()
        ).toBe('ability_datadriven');
        expect(
            root
                .FindTraverse((kv) => kv.Key === 'ability01')
                ?.FindKey('BaseClass')
                ?.GetValue()
        ).toBe('ability_lua');
        expect(
            root.FindKey('DOTAAbilities')?.FindKey('ability02')?.FindKey('BaseClass')?.GetValue()
        ).toBe(undefined);

        const root2 = await LoadKeyValues(join(__dirname, 'KeyValues.base.txt'));
        const list = AutoLoadKeyValuesBaseSync(root2, __dirname);
        expect(list[0].GetBaseFilePath()).toBe('npc/file01.txt');
        expect(list[1].GetBaseFilePath()).toBe('npc/file02.txt');
        expect(list[0].GetBaseAbsoluteFilePath()).toBe(
            join(__dirname, 'npc/file01.txt').replace(/\\/g, '/')
        );
        expect(list[0].toString()).toBe(`#base    "npc/file01.txt" // file01`);
        expect(list[1].toString()).toBe(`#base    "npc/file02.txt" // file02`);

        await SaveKeyValues(join(__dirname, 'KeyValues.base.save.txt'), root);
        SaveKeyValuesSync(join(__dirname, 'KeyValues.base.save.txt'), root2);

        try {
            list[0].LoadBase(join(__dirname, 'npc/file01.txt'), []);
        } catch (e) {
            expect(e).toEqual(Error(`#base does not have a value, maybe it's already loaded`));
        }
        try {
            const root3 = await LoadKeyValues(join(__dirname, 'KeyValues.base.txt'));
            root3.FindKey('#base')?.LoadBase(join(__dirname, 'npc/file02.txt'), []);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `FilePath:"${join(__dirname, 'npc/file02.txt').replace(
                        /\\/g,
                        '/'
                    )}" is not ends with npc/file01.txt`
                )
            );
        }
    });

    test('Check KeyValues.toObject', async () => {
        const kv = KeyValues.Parse(`a 123\nb {c 123}`);
        const obj = kv.toObject<{ a: string; b: { c: string } }>();
        expect(obj['a']).toBe('123');
        expect(obj['b']['c']).toBe('123');

        const kv2 = await LoadKeyValues(join(__dirname, 'KeyValues.txt'));
        const obj2 = kv2.toObject();
        expect(obj2['DOTAAbilities']['building_system_active_preview']['MaxLevel']).toBe('1');
        expect(typeof obj2['Ha']['t1']['ggg']).toBe('object');
        expect(typeof obj2['test']).toBe('object');

        try {
            new KeyValues('a', '123').toObject();
        } catch (e) {
            expect(e).toEqual(Error(`Not found children in this KeyValues`));
        }
    });
});
