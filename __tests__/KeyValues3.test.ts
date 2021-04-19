import { join } from 'path';
import {
    KeyValues3,
    LoadKeyValues3,
    SaveKeyValues3,
    LoadKeyValues3Sync,
    SaveKeyValues3Sync,
} from '../';

describe('KeyValues3', () => {
    test('Check KeyValues3 Methods', () => {
        const root = KeyValues3.CreateRoot();
        expect(root.IsRoot()).toBe(true);
        expect(root.GetHeader()).toBe(KeyValues3.CommonHeader);
        expect(root.GetValue().IsObject()).toBe(true);
        root.SetValue(new KeyValues3.Object());

        try {
            root.SetValue(new KeyValues3.String(''));
        } catch (e) {
            expect(e).toEqual(Error('The root node of KeyValues3 must be an object'));
        }

        try {
            root.AppendValue(new KeyValues3.String(''));
        } catch (e) {
            expect(e).toEqual(Error('The KeyValues3 is not an array'));
        }

        const a = root.CreateObjectValue('a', new KeyValues3.String('b'));
        expect(a.GetValue().IsString()).toBe(true);
        expect(a.GetValue().GetValue()).toBe('b');
        expect(a.GetValue().GetOwner() === a).toBe(true);

        const b = root.CreateObjectValue('b', new KeyValues3.Int(3.5));
        expect(b.GetValue().IsInt()).toBe(true);
        expect(b.GetValue().GetValue()).toBe(3);

        const c = root.CreateObjectValue('c', new KeyValues3.Double(3.5));
        expect(c.GetValue().IsDouble()).toBe(true);
        expect(c.GetValue().GetValue()).toBe(3.5);

        const d = root.CreateObjectValue('d', new KeyValues3.Boolean(true));
        expect(d.GetValue().IsBoolean()).toBe(true);
        expect(d.GetValue().GetValue()).toBe(true);

        const e = root.CreateObjectValue('e', new KeyValues3.Resource('x'));
        expect(e.GetValue().IsResource()).toBe(true);
        expect(e.GetValue().GetValue()).toBe('x');

        const f = root.CreateObjectValue('f', new KeyValues3.DeferredResource('x'));
        expect(f.GetValue().IsDeferredResource()).toBe(true);
        expect(f.GetValue().GetValue()).toBe('x');

        const g_ary = new KeyValues3.Array([]);
        const g = root.CreateObjectValue('g', g_ary);
        const g_first = new KeyValues3.String('gg');
        g_ary.Insert(g_first, 0);
        g_ary.Delete(g_first);
        expect(g.GetValue().IsArray()).toBe(true);
        expect(g.GetValue().GetValue()).toEqual([]);

        const h_obj = new KeyValues3.Object([]);
        const h = root.CreateObjectValue('h', h_obj);
        const h_fist = new KeyValues3('a', new KeyValues3.String('s'));
        h_obj.Insert(h_fist, 0);
        h_obj.Delete(h_fist);
        h_obj.Insert(h_fist, 0);
        h_obj.Delete('a');
        expect(h.GetValue().IsObject()).toBe(true);
        expect(h.GetValue().GetValue()).toEqual([]);
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
            a.CreateObjectValue('a', new KeyValues3.String('b'));
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

        g.AppendValue(new KeyValues3.String('text'))
            .Append(new KeyValues3.Int(1))
            .Append(new KeyValues3.Double(2.3))
            .Append(new KeyValues3.Boolean())
            .Append(
                new KeyValues3.Array([
                    new KeyValues3.String('1'),
                    new KeyValues3.String('2'),
                    new KeyValues3.Object([
                        new KeyValues3('c1', new KeyValues3.String('1')),
                        new KeyValues3('c2', new KeyValues3.String('2')),
                        new KeyValues3(
                            'c3',
                            new KeyValues3.Array([
                                new KeyValues3.Int(255),
                                new KeyValues3.Int(255),
                                new KeyValues3.Int(255),
                            ])
                        ),
                    ]),
                ])
            )
            .Append(
                new KeyValues3.Object([
                    new KeyValues3('c1', new KeyValues3.String('1')),
                    new KeyValues3('c2', new KeyValues3.String('2')),
                    new KeyValues3('c3', new KeyValues3.Array([new KeyValues3.String('1')])),
                ])
            );

        h.CreateObjectValue(
            'child',
            new KeyValues3.Object([
                new KeyValues3('@Start', new KeyValues3.String('1')),
                new KeyValues3('c1', new KeyValues3.String('1')),
                new KeyValues3('c2', new KeyValues3.String('2')),
                new KeyValues3(
                    'c3',
                    new KeyValues3.Array([
                        new KeyValues3.Resource(
                            'particles/avalon_assets/environment/battle_ring/battle_ring_d.vpcf'
                        ),
                    ])
                ),
                new KeyValues3(
                    'c3',
                    new KeyValues3.Array([
                        new KeyValues3.Resource('particles/a.vpcf'),
                        new KeyValues3.Resource('particles/b.vpcf'),
                        new KeyValues3.Resource('particles/c.vpcf'),
                        new KeyValues3.Resource('particles/d.vpcf'),
                        new KeyValues3.Resource('particles/e.vpcf'),
                    ])
                ),
            ])
        );

        h.CreateObjectValue(
            'multi.line',
            new KeyValues3.String(`
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
        const a = root.CreateObjectValue('a', new KeyValues3.String('b'));
        a.GetValue().Comments.AppendComment('line 1');
        expect(a.GetValue().Comments.GetComments()).toEqual(['line 1']);

        a.GetValue().Comments.AppendComment('line 2');
        a.GetValue().Comments.AppendComment('multi-line 1\nmulti-line 2');
        a.GetValue().Comments.AppendComment('*multi-line 1\n* multi-line 2\n*    ml3\nm4');
        a.GetValue().Comments.SetEndOfLineComment('end a');
        const pa = new KeyValues3.Resource('particles/a.vpcf');
        pa.Comments.AppendComment('line 1');
        pa.Comments.AppendComment('line 1 \n line 2');
        pa.Comments.SetEndOfLineComment('eeend');
        const c = root.CreateObjectValue(
            'c',
            new KeyValues3.Object([
                new KeyValues3('particles', new KeyValues3.Array([pa])),
                a,
                new KeyValues3('q', new KeyValues3.String('qq')),
            ])
        );
        c.GetValue().Comments.SetEndOfLineComment('end c');
        const q = new KeyValues3.String('qq');
        q.Comments.SetEndOfLineComment('qq');
        const a3 = root.CreateObjectValue('a', new KeyValues3.Array([q]));
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
        expect(root.FindKey('boolValue')?.GetValue().GetValue()).toBe(false);
        expect(root.FindKey('intValue')?.GetValue().GetValue()).toBe(128);
        expect(root.FindKey('doubleValue')?.GetValue().GetValue()).toBe(64);
        expect(root.FindKey('intValue')?.GetValue().IsInt()).toBe(true);
        expect(root.FindKey('doubleValue')?.GetValue().IsDouble()).toBe(true);
        expect(root.FindKey('stringValue')?.GetValue().GetValue()).toBe(
            `hello world \\n \\"ss\\" `
        );
        expect(root.FindKey('stringThatIsAResourceReference')?.GetValue().GetValue()).toBe(
            'particles/items3_fx/star_emblem.vpcf'
        );
        expect(root.FindKey('multiLineStringValue')?.GetValue().GetValue()).toBe(`
First line of a multi-line string literal.
Second line of a multi-line string literal.
`);
        const ary = root.FindKey('arrayValue')?.GetValue();
        expect(ary?.IsArray()).toBe(true);

        if (ary?.IsArray()) {
            expect(ary.GetValue()[0].GetValue()).toBe(1);
            expect(ary.GetValue()[1].GetValue()).toBe(2);
            expect(ary.GetValue()[2].IsObject()).toBe(true);
            expect(ary.GetValue()[3].IsResource()).toBe(true);
            expect(ary.GetValue()[3].GetValue()).toBe('particles/items3_fx/star_emblem.vpcf');
        }

        const obj = root.FindKey('objectValue')?.GetValue();
        if (obj?.IsObject()) {
            expect(obj.FindKey('n')?.GetValue().GetValue()).toBe(5);
            expect(obj.FindKey('s')?.GetValue().GetValue()).toBe('foo');
            expect(obj.FindKey('h')?.GetValue().IsArray()).toBe(true);
        }

        expect(
            root
                .FindKey('objectValue')
                ?.FindKey('h')
                ?.GetValue()
                .GetValue()
                .map((v: any) => v.GetValue())
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
    });
});
