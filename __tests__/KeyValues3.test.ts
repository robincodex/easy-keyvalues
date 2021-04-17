import { KeyValues3 } from '../';

describe('KeyValues3', () => {
    test('Check KeyValues3 Value', () => {
        const root = KeyValues3.CreateRoot();
        expect(root.IsRoot()).toBe(true);
        expect(root.GetHeader()).toBe(KeyValues3.CommonHeader);
        expect(root.GetValue().IsObject()).toBe(true);

        const a = root.CreateObjectValue('a', new KeyValues3.String('b'));
        expect(a.GetValue().IsString()).toBe(true);
        expect(a.GetValue().GetValue()).toBe('b');

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

        const g = root.CreateObjectValue('g', new KeyValues3.Array([]));
        expect(g.GetValue().IsArray()).toBe(true);
        expect(g.GetValue().GetValue()).toEqual([]);

        const h = root.CreateObjectValue('h', new KeyValues3.Object([]));
        expect(h.GetValue().IsObject()).toBe(true);
        expect(h.GetValue().GetValue()).toEqual([]);

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

        expect(root.FindAllKey('e').length).toBe(1);

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
    c = 3.5
    d = true
    e = resource:"x"
    f = deferred_resource:"x"
    g =
    [
        "text",
        1,
        2.3,
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

        const root2 = KeyValues3.CreateRoot();
        const a2 = root2.CreateObjectValue('a', new KeyValues3.String('b'));
        a2.GetValue().Comments.AppendComment('line 1');
        a2.GetValue().Comments.AppendComment('line 2');
        a2.GetValue().Comments.AppendComment('multi-line 1\nmulti-line 2');
        a2.GetValue().Comments.AppendComment('*multi-line 1\n* multi-line 2\nml3');
        a2.GetValue().Comments.SetEndOfLineComment('end a');
        const pa = new KeyValues3.Resource('particles/a.vpcf');
        pa.Comments.AppendComment('line 1');
        pa.Comments.AppendComment('line 1 \n line 2');
        pa.Comments.SetEndOfLineComment('eeend');
        const c2 = root2.CreateObjectValue(
            'c',
            new KeyValues3.Object([
                new KeyValues3('particles', new KeyValues3.Array([pa])),
                a2,
                new KeyValues3('q', new KeyValues3.String('qq')),
            ])
        );
        c2.GetValue().Comments.SetEndOfLineComment('end c');
        const q = new KeyValues3.String('qq');
        q.Comments.SetEndOfLineComment('qq');
        const a3 = root2.CreateObjectValue('a', new KeyValues3.Array([q]));
        a3.GetValue().Comments.SetEndOfLineComment('end');
        // console.log(root2.toString());
        expect(root2.toString()).toBe(`${KeyValues3.CommonHeader}
{
    // line 1
    // line 2
    /*
    multi-line 1
    multi-line 2
    */
    /*
     * multi-line 1
     * multi-line 2
     * ml3
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
         * multi-line 1
         * multi-line 2
         * ml3
         */
        a = "b" // end a
        q = "qq"
    } // end c
    a =
    [
        "qq", // qq
    ] // end
}`);
    });
});
