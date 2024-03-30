import { describe, expect, test } from '@jest/globals';
import crypto from 'crypto';
import { join } from 'path';
import { KeyValues, getKeyValuesAdapter } from '../src/node';

function testKV(kv: KeyValues) {
    expect(kv.GetChildCount()).toBe(3);

    expect(kv.GetChildren().map((v) => v.Key)).toEqual(['DOTAAbilities', 'Ha', 'test']);

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
            ?.GetValue(),
    ).toBe('abaddon/mistral_fiend_icons//abaddon_borrowed_time');

    expect(kv.FindKey('test')?.FindKey('children')?.FindKey('c2')?.GetValue()).toBe('2 \\"two\\"');

    expect(kv.FindKey('test')?.Comments?.GetComments()[0]).toBe('test object');

    expect(kv.FindKey('test')?.FindKey('children')?.Comments?.GetComments()).toEqual([
        'comment02',
        'comment03',
        'comment04',
    ]);

    expect(kv.FindKey('test')?.FindKey('children')?.Comments?.GetEndOfLineComment()).toBe(
        'this is children',
    );

    expect(kv.FindKey('test')?.FindKey('children')?.FindKey('c3')?.GetValue()).toBe(
        'sss\n    <br/>this is child\\n index 3\n    88',
    );
}

describe('KeyValues', () => {
    test('Check KeyValues.txt', async () => {
        const kv = await KeyValues.Load(join(__dirname, 'KeyValues.txt'));
        testKV(kv);
        expect(kv.toString()).toMatchSnapshot();
    });

    test('Check chat_english.txt', async () => {
        const kv = await KeyValues.Load(join(__dirname, 'chat_english.txt'));
        const tokens = kv.FindKey('lang')?.FindKey('Tokens');
        expect(!tokens).toBe(false);
        expect(tokens?.GetChildCount()).toBe(11);
    });

    test('Check gameui_english.txt', async () => {
        const kv = await KeyValues.Load(join(__dirname, 'gameui_english.txt'));
        const tokens = kv.FindKey('lang')?.FindKey('Tokens');
        expect(!tokens).toBe(false);
        expect(tokens?.GetChildCount()).toBe(688);
        expect(tokens?.FindKey('GameUI_JoystickMoveLookSticks')?.Flags).toBe('$WIN32');
        expect(
            tokens
                ?.FindAllKeys('GameUI_JoystickMoveLookSticks')
                ?.map((v) => v.Flags)
                .join(','),
        ).toBe('$WIN32,$X360');
    });

    test('Check KeyValues.save.txt', async () => {
        const kv = await KeyValues.Load(join(__dirname, 'KeyValues.save.txt'));
        testKV(kv);
        await kv.Save();
    });

    test('Check KeyValues Parse Error', async () => {
        await KeyValues.Parse(`a 123\nb {c 123}`);
        expect(async () => {
            await KeyValues.Parse(`a{} 123`);
        }).rejects.toThrow();

        expect(async () => {
            await KeyValues.Parse(`a[] 123`);
        }).rejects.toThrow();

        expect(async () => {
            await KeyValues.Parse(`a" 123`);
        }).rejects.toThrow();

        expect(async () => {
            await KeyValues.Parse(`/* a */`);
        }).rejects.toThrow();
    });

    test('Create/Append/Insert/Delete KeyValues', async () => {
        const root = KeyValues.CreateRoot();
        root.CreateChild('a', 'b');
        root.CreateChild('#base', 'file.kv');
        expect(root.toString()).toBe(`"a"    "b"\n#base    "file.kv"`);
        expect(root.GetParent()).toBe(undefined);
        expect(root.GetFirstChild()?.Key).toBe('a');
        expect(root.GetFirstChild()?.GetParent() === root).toBe(true);

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
}`,
        );

        const cloneRoot = root.Clone();
        expect(cloneRoot === root).toBe(false);
        expect(cloneRoot.toString()).toBe(root.toString());

        cloneRoot.GetFirstChild()!.Key = 'b';
        cloneRoot.FindKey('c')?.FindKey('d')?.Append(new KeyValues('c', 'c'));
        expect(root.GetFirstChild()!.Key).toBe('a');
        expect(cloneRoot.FindKey('c')?.FindKey('d')?.FindKey('c')?.GetValue()).toBe('c');
        expect(root.FindKey('c')?.FindKey('d')?.FindKey('c') === undefined).toBe(true);

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
        expect(c?.GetParent() === undefined).toBe(true);
    });

    test('Check Comment', async () => {
        const testComment = new KeyValues('d', 'a');
        testComment.Comments.SetComments(['line1', 'line2']).SetEndOfLineComment('end');
        expect(testComment.toString()).toBe(`// line1
// line2
"d"    "a" // end`);

        expect(() => {
            testComment.Comments.AppendComment('a\nc');
        }).toThrow();

        expect(() => {
            testComment.Comments.SetEndOfLineComment('a\nc');
        }).toThrow();

        expect(() => {
            testComment.Comments.SetComments(['a\nc']);
        }).toThrow();
    });

    test('Check KeyValues Error', () => {
        const kv = new KeyValues('a', []);
        expect(kv.GetValue()).toBe('');
        kv.SetValue('');
        expect(kv.GetChildren().length).toBe(0);

        expect(() => {
            kv.Append(new KeyValues(''));
        }).toThrow();

        expect(() => {
            kv.Insert(new KeyValues(''), 0);
        }).toThrow();

        expect(async () => {
            await kv.Save();
        }).rejects.toThrow();

        expect(kv.Find((v) => true) === undefined).toBe(true);
        expect(kv.FindKey('') === undefined).toBe(true);
        expect(kv.FindTraverse((v) => true) === undefined).toBe(true);
        expect(kv.FindAll((v) => true).length).toEqual(0);
        expect(kv.FindAllKeys('').length).toEqual(0);
        expect(kv.Delete('') === undefined).toBe(true);

        expect(() => {
            const root = KeyValues.CreateRoot();
            // @ts-ignore
            root.value = '';
            // @ts-ignore
            delete root.children;
            root.Format();
        }).toThrow();

        expect(() => {
            KeyValues.CreateRoot().SetValue('');
        }).toThrow();

        expect(() => {
            const kv = new KeyValues('a', []);
            kv.Append(kv);
        }).toThrow();

        expect(() => {
            const kv = new KeyValues('a', []);
            kv.Insert(kv, 0);
        }).toThrow();

        expect(() => {
            const kv = new KeyValues('a', []);
            kv.SetValue([kv]);
        }).toThrow();
    });

    test('Check KeyValues #base', async () => {
        const root = await KeyValues.Load(join(__dirname, 'KeyValues.base.txt'));
        expect(
            root.FindKey('DOTAAbilities')?.FindKey('ability01')?.FindKey('BaseClass')?.GetValue(),
        ).toBe('ability_datadriven');
        expect(
            root.FindKey('DOTAAbilities')?.FindKey('ability02')?.FindKey('BaseClass')?.GetValue(),
        ).toBe(undefined);

        const root2 = await KeyValues.Load(join(__dirname, 'KeyValues.base.txt'));
        const list = root2.GetBaseList();
        expect(list[0].GetBaseFilePath()).toBe('npc/file01.txt');
        expect(list[1].GetBaseFilePath()).toBe('npc/file02.txt');
        expect(list[0].filename).toBe(join(__dirname, 'npc/file01.txt').replace(/\\/g, '/'));
        expect(list[0].toString()).toBe(`#base    "npc/file01.txt" // file01`);
        expect(list[1].toString()).toBe(`#base    "npc/file02.txt" // file02`);

        await root.Save();
        await root.Save(join(__dirname, 'base_other/root.txt'));

        const base = new KeyValues('#base', 'npc/file01.txt');
        base.Comments.SetEndOfLineComment('file01');
        expect(base.toString()).toMatchSnapshot();
    });

    test('Check KeyValues.toObject', async () => {
        const kv = await KeyValues.Parse(`a 123\nb {c 123}`);
        const obj = kv.toObject<{ a: string; b: { c: string } }>();
        expect(obj['a']).toBe('123');
        expect(obj['b']['c']).toBe('123');

        const kv2 = await KeyValues.Load(join(__dirname, 'KeyValues.txt'));
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

    test('Check KeyValues.ID', async () => {
        const noRootID = KeyValues.CreateRoot();
        expect(noRootID.ID).toBe('');

        getKeyValuesAdapter().createKeyValuesID = () => {
            return crypto.randomBytes(8).toString('hex');
        };
        const root = KeyValues.CreateRoot();
        expect(root.ID).toHaveLength(16);

        const a = new KeyValues('a', 'a');
        const b = new KeyValues('b', 'b');
        const d = new KeyValues('d', 'd');
        const e = new KeyValues('e', [d]);
        const c = new KeyValues('a', [e]);
        root.Append(a);
        root.Append(b);
        root.Append(c);
        expect(root.FindID(a.ID) === a).toBe(true);
        expect(root.FindID(b.ID) === b).toBe(true);
        expect(root.FindID(c.ID) === c).toBe(true);
        expect(root.FindID(d.ID) === undefined).toBe(true);
        expect(root.FindID(e.ID) === undefined).toBe(true);
        expect(root.FindIDTraverse(a.ID) === a).toBe(true);
        expect(root.FindIDTraverse(b.ID) === b).toBe(true);
        expect(root.FindIDTraverse(c.ID) === c).toBe(true);
        expect(root.FindIDTraverse(d.ID) === d).toBe(true);
        expect(root.FindIDTraverse(e.ID) === e).toBe(true);
    });
});
