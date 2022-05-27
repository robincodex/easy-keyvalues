import { join } from 'path';
import { KV3BaseValue } from '../src/KeyValues3';
import {
    KeyValues3,
    LoadKeyValues3,
    SaveKeyValues3,
    LoadKeyValues3Sync,
    SaveKeyValues3Sync,
} from '../src/node';

describe('KeyValues3', () => {
    test('Check KeyValues3 Methods', () => {
        const root = KeyValues3.CreateRoot();
        expect(root.IsRoot()).toBe(true);
        expect(root.GetHeader()).toBe(KeyValues3.CommonHeader);
        expect(root.GetValue().IsObject()).toBe(true);
        root.SetValue(KeyValues3.Object());
        const value = new KV3BaseValue();
        expect(value.Value()).toBe(undefined);

        try {
            root.SetValue(KeyValues3.String(''));
        } catch (e) {
            expect(e).toEqual(Error('The root node of KeyValues3 must be an object'));
        }

        try {
            root.AppendValue(KeyValues3.String(''));
        } catch (e) {
            expect(e).toEqual(Error('The KeyValues3 is not an array'));
        }

        const a = root.CreateObjectValue('a', KeyValues3.String('b'));
        expect(a.GetValue().IsString()).toBe(true);
        expect(a.GetValue().Value()).toBe('b');
        expect(a.GetValue().GetOwner() === a).toBe(true);
        expect(root.GetObject().Get(0)).toBe(a);

        try {
            a.GetObject();
        } catch (e) {
            expect(e).toEqual(Error('The value is not object'));
        }
        try {
            a.GetArray();
        } catch (e) {
            expect(e).toEqual(Error('The value is not array'));
        }

        const b = root.CreateObjectValue('b', KeyValues3.Int(3.5));
        expect(b.GetValue().IsInt()).toBe(true);
        expect(b.GetValue().Value()).toBe(3);

        const c = root.CreateObjectValue('c', KeyValues3.Double(3.5));
        expect(c.GetValue().IsDouble()).toBe(true);
        expect(c.GetValue().Value()).toBe(3.5);

        const d = root.CreateObjectValue('d', KeyValues3.Boolean(true));
        expect(d.GetValue().IsBoolean()).toBe(true);
        expect(d.GetValue().Value()).toBe(true);

        const e = root.CreateObjectValue('e', KeyValues3.Resource('x'));
        expect(e.GetValue().IsResource()).toBe(true);
        expect(e.GetValue().Value()).toBe('x');

        const f = root.CreateObjectValue('f', KeyValues3.DeferredResource('x'));
        expect(f.GetValue().IsDeferredResource()).toBe(true);
        expect(f.GetValue().Value()).toBe('x');

        const g_ary = KeyValues3.Array([]);
        const g = root.CreateObjectValue('g', g_ary);
        const g_first = KeyValues3.String('gg');
        g_ary.Insert(0, g_first);
        g_ary.Delete(g_first);
        expect(g.GetValue().IsArray()).toBe(true);
        expect(g.GetValue().Value()).toEqual([]);
        expect(g.GetArray().Get(0)).toBe(undefined);

        const h_obj = KeyValues3.Object([]);
        const h = root.CreateObjectValue('h', h_obj);
        const h_fist = new KeyValues3('a', KeyValues3.String('s'));
        h_obj.Insert(0, h_fist);
        h_obj.Delete(h_fist);
        h_obj.Insert(0, h_fist);
        h_obj.Delete('a');
        expect(h.GetValue().IsObject()).toBe(true);
        expect(h.GetValue().Value()).toEqual([]);
        h_obj.Append(h_fist);
        h_obj.Append(h_fist);
        h_obj.Append(h_fist);
        expect(h.FindAllKeys('a').length).toBe(3);
        expect(h_obj.FindAllKeys('a').length).toBe(3);
        expect(h.Find(() => false)).toBe(undefined);
        h_obj.Delete('a');
        h_obj.Delete('a');
        h_obj.Delete('a');

        try {
            a.CreateObjectValue('a', KeyValues3.String('b'));
        } catch (e) {
            expect(e).toEqual(Error('The KeyValues3 is not an object'));
        }
        try {
            a.Find(() => true);
        } catch (e) {
            expect(e).toEqual(Error('The KeyValues3 is not an object'));
        }
        try {
            a.FindAll(() => true);
        } catch (e) {
            expect(e).toEqual(Error('The KeyValues3 is not an object'));
        }

        expect(
            root
                .Find((kv) => kv.Key === 'g')
                ?.GetValue()
                .IsArray()
        ).toBe(true);

        expect(root.FindKey('e')?.GetValue().IsResource()).toBe(true);

        expect(root.FindAllKeys('e').length).toBe(1);

        g.AppendValue(KeyValues3.String('text'))
            .Append(KeyValues3.Int(1))
            .Append(KeyValues3.Double(2.3))
            .Append(KeyValues3.Boolean())
            .Append(
                KeyValues3.Array([
                    KeyValues3.String('1'),
                    KeyValues3.String('2'),
                    KeyValues3.Object([
                        new KeyValues3('c1', KeyValues3.String('1')),
                        new KeyValues3('c2', KeyValues3.String('2')),
                        new KeyValues3(
                            'c3',
                            KeyValues3.Array([
                                KeyValues3.Int(255),
                                KeyValues3.Int(255),
                                KeyValues3.Int(255),
                            ])
                        ),
                    ]),
                ])
            )
            .Append(
                KeyValues3.Object([
                    new KeyValues3('c1', KeyValues3.String('1')),
                    new KeyValues3('c2', KeyValues3.String('2')),
                    new KeyValues3('c3', KeyValues3.Array([KeyValues3.String('1')])),
                ])
            );

        h.CreateObjectValue(
            'child',
            KeyValues3.Object([
                new KeyValues3('@Start', KeyValues3.String('1')),
                new KeyValues3('c1', KeyValues3.String('1')),
                new KeyValues3('c2', KeyValues3.String('2')),
                new KeyValues3(
                    'c3',
                    KeyValues3.Array([
                        KeyValues3.Resource(
                            'particles/avalon_assets/environment/battle_ring/battle_ring_d.vpcf'
                        ),
                    ])
                ),
                new KeyValues3(
                    'c3',
                    KeyValues3.Array([
                        KeyValues3.Resource('particles/a.vpcf'),
                        KeyValues3.Resource('particles/b.vpcf'),
                        KeyValues3.Resource('particles/c.vpcf'),
                        KeyValues3.Resource('particles/d.vpcf'),
                        KeyValues3.Resource('particles/e.vpcf'),
                    ])
                ),
            ])
        );

        h.CreateObjectValue(
            'multi.line',
            KeyValues3.String(`
First line of a multi-line string literal.
Second line of a multi-line string literal.
`)
        );

        // console.log(root.Format());
        expect(root.toString()).toBe(`${KeyValues3.CommonHeader}
{
    a = "b"
    b = 3
    c = 3.500000
    d = true
    e = resource:"x"
    f = deferred_resource:"x"
    g =
    [
        "text",
        1,
        2.300000,
        false,
        [
            "1",
            "2",
            {
                c1 = "1"
                c2 = "2"
                c3 = [ 255, 255, 255 ]
            },
        ],
        {
            c1 = "1"
            c2 = "2"
            c3 = [ "1" ]
        },
    ]
    h =
    {
        child =
        {
            "@Start" = "1"
            c1 = "1"
            c2 = "2"
            c3 =
            [
                resource:"particles/avalon_assets/environment/battle_ring/battle_ring_d.vpcf",
            ]
            c3 =
            [
                resource:"particles/a.vpcf",
                resource:"particles/b.vpcf",
                resource:"particles/c.vpcf",
                resource:"particles/d.vpcf",
                resource:"particles/e.vpcf",
            ]
        }
        multi.line = """
First line of a multi-line string literal.
Second line of a multi-line string literal.
"""
    }
}`);
    });

    test('Check KeyValues3 Comments', () => {
        const root = KeyValues3.CreateRoot();
        const a = root.CreateObjectValue('a', KeyValues3.String('b'));
        a.GetValue().Comments.AppendComment('line 1');
        expect(a.GetValue().Comments.GetComments()).toEqual(['line 1']);

        a.GetValue().Comments.AppendComment('line 2');
        a.GetValue().Comments.AppendComment('multi-line 1\nmulti-line 2');
        a.GetValue().Comments.AppendComment('*multi-line 1\n* multi-line 2\n*    ml3\nm4');
        a.GetValue().Comments.SetEndOfLineComment('end a');
        const pa = KeyValues3.Resource('particles/a.vpcf');
        pa.Comments.AppendComment('line 1');
        pa.Comments.AppendComment('line 1 \n line 2');
        pa.Comments.SetEndOfLineComment('eeend');
        const c = root.CreateObjectValue(
            'c',
            KeyValues3.Object([
                new KeyValues3('particles', KeyValues3.Array([pa])),
                a,
                new KeyValues3('q', KeyValues3.String('qq')),
            ])
        );
        c.GetValue().Comments.SetEndOfLineComment('end c');
        const q = KeyValues3.String('qq');
        q.Comments.SetEndOfLineComment('qq');
        const a3 = root.CreateObjectValue('a', KeyValues3.Array([q]));
        a3.GetValue().Comments.SetEndOfLineComment('end');
        // console.log(root2.toString());
        expect(root.toString()).toBe(`${KeyValues3.CommonHeader}
{
    // line 1
    // line 2
    /*
    multi-line 1
    multi-line 2
    */
    /*
     *multi-line 1
     * multi-line 2
     *    ml3
     * m4
     */
    a = "b" // end a
    c =
    {
        particles =
        [
            // line 1
            /*
            line 1 
            line 2
            */
            resource:"particles/a.vpcf", // eeend
        ]
        // line 1
        // line 2
        /*
        multi-line 1
        multi-line 2
        */
        /*
         *multi-line 1
         * multi-line 2
         *    ml3
         * m4
         */
        a = "b" // end a
        q = "qq"
    } // end c
    a =
    [
        "qq", // qq
    ] // end
}`);

        try {
            a.GetValue().Comments.SetEndOfLineComment('a\nc');
        } catch (e) {
            expect(e).toEqual(Error('The end of line comment only allowed one line'));
        }
    });

    test('Check KeyValues3.txt', async () => {
        const root = await LoadKeyValues3(join(__dirname, 'KeyValues3.txt'));
        await SaveKeyValues3(join(__dirname, 'KeyValues3.save.txt'), root);

        const root2 = LoadKeyValues3Sync(join(__dirname, 'KeyValues3.save.txt'));
        SaveKeyValues3Sync(join(__dirname, 'KeyValues3.save.txt'), root2);

        checkTxt(root);
        checkTxt(root2);
    });

    function checkTxt(root: KeyValues3) {
        expect(root.IsRoot()).toBe(true);
        expect(root.GetHeader()).toBe(KeyValues3.CommonHeader);
        expect(root.GetValue().IsObject()).toBe(true);
        expect(root.FindKey('boolValue')?.GetValue().Value()).toBe(false);
        expect(root.FindKey('intValue')?.GetValue().Value()).toBe(128);
        expect(root.FindKey('doubleValue')?.GetValue().Value()).toBe(64);
        expect(root.FindKey('intValue')?.GetValue().IsInt()).toBe(true);
        expect(root.FindKey('doubleValue')?.GetValue().IsDouble()).toBe(true);
        expect(root.FindKey('stringValue')?.GetValue().Value()).toBe(`hello world \\n \\"ss\\" `);
        expect(root.FindKey('stringThatIsAResourceReference')?.GetValue().Value()).toBe(
            'particles/items3_fx/star_emblem.vpcf'
        );
        expect(root.FindKey('multiLineStringValue')?.GetValue().Value()).toBe(`
First line of a multi-line string literal.
Second line of a multi-line string literal.
`);
        const ary = root.FindKey('arrayValue')?.GetValue();
        expect(ary?.IsArray()).toBe(true);

        if (ary?.IsArray()) {
            expect(ary.Value()[0].Value()).toBe(1);
            expect(ary.Value()[1].Value()).toBe(2);
            expect(ary.Value()[2].IsObject()).toBe(true);
            expect(ary.Value()[3].IsResource()).toBe(true);
            expect(ary.Value()[3].Value()).toBe('particles/items3_fx/star_emblem.vpcf');
        }

        const obj = root.FindKey('objectValue')?.GetValue();
        if (obj?.IsObject()) {
            expect(obj.FindKey('n')?.GetValue().Value()).toBe(5);
            expect(obj.FindKey('s')?.GetValue().Value()).toBe('foo');
            expect(obj.FindKey('h')?.GetValue().IsArray()).toBe(true);
        }

        expect(
            root
                .FindKey('objectValue')
                ?.FindKey('h')
                ?.GetValue()
                .Value()
                .map((v: any) => v.Value())
        ).toEqual(['a', 456]);
    }

    test('Check KeyValues3 Parse Error', () => {
        try {
            KeyValues3.Parse(`{}`);
        } catch (e) {
            expect(e).toEqual(Error('Invalid header'));
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n @a = 123 \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid member name '@a'`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n $a = 123 \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid member name '$a'`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n #a = 123 \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid member name '#a'`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = """ a """ \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 3: multi-line start identifier """ must be followed by newline`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = """
 a 
 """ \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 5: multi-line end identifier """ must be at the beginning of line`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{
    a = 
    [
        """ 
        a 
 """] \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 5: multi-line start identifier """ must be followed by newline`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{
    a = 
    [
        """
        a 
 """] \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 7: multi-line end identifier """ must be at the beginning of line`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = """
 a 
"" \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 5: multi-line string must be end with """`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = ["""
 a 
""] \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(
                    `not readable as KeyValues3 text: Line 5: multi-line string must be end with """`
                )
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = custom:"" \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid value 'custom:""'`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n {} = a \n}`);
        } catch (e) {
            expect(e).toEqual(Error(`not readable as KeyValues3 text: Line 3: Invalid char '{'`));
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n [] = a \n}`);
        } catch (e) {
            expect(e).toEqual(Error(`not readable as KeyValues3 text: Line 3: Invalid char '['`));
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n = a \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid member name '='`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = [custom:""] \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Invalid value 'custom:""'`)
            );
        }

        try {
            KeyValues3.Parse(`${KeyValues3.CommonHeader}\n{\n a = ["b" "c"] \n}`);
        } catch (e) {
            expect(e).toEqual(
                Error(`not readable as KeyValues3 text: Line 3: Expected ',' or ']'`)
            );
        }

        try {
            // @ts-ignore
            KeyValues3._parse(new KeyValues3('', KeyValues3.String('')), {
                body: '',
                pos: 0,
                tokenCounter: 0,
                line: 0,
            });
        } catch (e) {
            expect(e).toEqual(Error("Parent's value must be an object or array"));
        }
    });

    test('Check KeyValues3.toObject', async () => {
        const root = await LoadKeyValues3(join(__dirname, 'KeyValues3.txt'));
        const obj = root.toObject();
        expect(obj['boolValue']).toBe(false);
        expect(obj['intValue']).toBe(128);
        expect(obj['doubleValue']).toBe(64);
        expect(obj['stringValue']).toBe('hello world \\n \\"ss\\" ');
        expect(obj['stringThatIsAResourceReference']).toBe('particles/items3_fx/star_emblem.vpcf');
        expect(obj['arrayValue'][2]['b']).toBe('456');
        expect(obj['array.Value'][1]).toBe(2.5);
        expect(obj['objectValue']['j'][0][0]['a']).toBe('456.0.5');

        const obj2 = new KeyValues3('a', KeyValues3.Int(1)).toObject();
        expect(obj2['a']).toBe(1);
    });

    test('Check KeyValues3.Clone', async () => {
        const root = KeyValues3.CreateRoot();
        root.CreateObjectValue('a', KeyValues3.String('b'));
        root.CreateObjectValue('b', KeyValues3.Boolean(false));
        root.CreateObjectValue('c', KeyValues3.Int(1));
        root.CreateObjectValue('d', KeyValues3.Double(2));
        root.CreateObjectValue('e', KeyValues3.Resource('path.vpcf'));
        root.CreateObjectValue('f', KeyValues3.DeferredResource('path.vpcf'));
        root.CreateObjectValue('g', KeyValues3.Array([KeyValues3.String('b')]));
        root.CreateObjectValue('h', KeyValues3.Object([]));

        const cloneRoot = root.Clone();
        expect(cloneRoot !== root).toBe(true);
        expect(cloneRoot.GetValue() !== root.GetValue()).toBe(true);
        expect(cloneRoot.GetObject().FindKey('h') !== root.GetObject().FindKey('h')).toBe(true);

        cloneRoot.GetObject().Get(0)?.SetValue(KeyValues3.String('c'));
        expect(cloneRoot.GetObject().Get(0)?.GetValue().Value()).toBe('c');
        expect(root.GetObject().Get(0)?.GetValue().Value()).toBe('b');

        cloneRoot.GetObject().FindKey('g')?.AppendValue(KeyValues3.String('c'));
        expect(root.GetObject().FindKey('g')?.GetValue().Value().length).toBe(1);
        expect(cloneRoot.GetObject().FindKey('g')?.GetValue().Value().length).toBe(2);

        cloneRoot.GetObject().FindKey('h')?.CreateObjectValue('test', KeyValues3.String('1'));
        expect(root.GetObject().FindKey('h')?.GetValue().Value().length).toBe(0);
        expect(cloneRoot.GetObject().FindKey('h')?.GetValue().Value().length).toBe(1);

        new KV3BaseValue().Clone();
    });

    test('Check KeyValues3.ID', async () => {
        KeyValues3.SetIDEnabled(false);
        const noIDRoot = KeyValues3.CreateRoot();
        expect(noIDRoot.ID).toBe('');

        KeyValues3.SetIDEnabled(true);
        const root = KeyValues3.CreateRoot();
        expect(root.ID).toHaveLength(21);

        const a = root.CreateObjectValue('a', KeyValues3.String('a'));
        const b = root.CreateObjectValue('b', KeyValues3.String('b'));
        const c = root.CreateObjectValue('c', KeyValues3.String('c'));
        const d = root.CreateObjectValue('d', KeyValues3.String('d'));
        expect(root.FindID(a.ID)).toBe(a);
        expect(root.FindID(b.ID)).toBe(b);
        expect(root.FindID(c.ID)).toBe(c);
        expect(root.FindID(d.ID)).toBe(d);

        const a2 = new KeyValues3('a2', KeyValues3.String('a2'));
        const b2 = new KeyValues3('b2', KeyValues3.String('b2'));
        const d2 = new KeyValues3('d2', KeyValues3.String('d2'));
        const c2 = new KeyValues3('c2', KeyValues3.Object([d2]));
        const b3 = new KeyValues3('b3', KeyValues3.String('b3'));
        const c3 = new KeyValues3('c3', KeyValues3.String('c3'));
        const a3 = new KeyValues3(
            'a3',
            KeyValues3.Array([KeyValues3.Object([b3]), KeyValues3.Array([KeyValues3.Object([c3])])])
        );
        const e = root.CreateObjectValue('e', KeyValues3.Object([a2, b2, c2, a3]));
        expect(root.FindID(e.ID)).toBe(e);
        expect(root.FindID(a2.ID)).toBeUndefined();
        expect(root.FindID(b2.ID)).toBeUndefined();
        expect(root.FindID(c2.ID)).toBeUndefined();
        expect(root.FindID(d2.ID)).toBeUndefined();
        expect(root.FindID(a3.ID)).toBeUndefined();
        expect(root.FindID(b3.ID)).toBeUndefined();
        expect(root.FindID(c3.ID)).toBeUndefined();
        expect(e.FindID(a2.ID)).toBe(a2);
        expect(e.FindID(b2.ID)).toBe(b2);
        expect(e.FindID(c2.ID)).toBe(c2);
        expect(e.FindID(d2.ID)).toBeUndefined();
        expect(e.FindID(a3.ID)).toBe(a3);
        expect(e.FindID(b3.ID)).toBeUndefined();
        expect(e.FindID(c3.ID)).toBeUndefined();
        expect(root.FindIDTraverse(a2.ID)).toBe(a2);
        expect(root.FindIDTraverse(b2.ID)).toBe(b2);
        expect(root.FindIDTraverse(c2.ID)).toBe(c2);
        expect(root.FindIDTraverse(d2.ID)).toBe(d2);
        expect(root.FindIDTraverse(b3.ID)).toBe(b3);
        expect(root.FindIDTraverse(c3.ID)).toBe(c3);
        expect(a3.GetArray().FindIDTraverse(a2.ID)).toBeUndefined();
    });

    test('Check KeyValues3 Header', async () => {
        const root = await LoadKeyValues3(join(__dirname, 'npc/particle.vpcf'));
        expect(root.GetHeader()).toBe(
            '<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:vpcf36:version{d15c9157-10e0-47bc-9333-1ac81da07b8d} -->'
        );
    });

    test('Check KeyValues3 Header', async () => {
        const root = await LoadKeyValues3(join(__dirname, 'npc/particle.vpcf'));
        expect(root.GetHeader()).toBe(
            '<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:vpcf36:version{d15c9157-10e0-47bc-9333-1ac81da07b8d} -->'
        );
    });

    test('Check KeyValues3 Null', async () => {
        const root = await LoadKeyValues3(join(__dirname, 'npc/null.txt'));
        const a = root.GetObject().FindKey('a')?.GetArray();
        expect(a?.Value().map((v) => v.Value())).toStrictEqual([null, null, null]);
        const b = root.GetObject().FindKey('b')?.GetValue();
        expect(b?.Value()).toBe(null);
    });
});
