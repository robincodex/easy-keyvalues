import { describe, test } from '@jest/globals';
import { join } from 'path';
import { KeyValues3 } from '../src/node';

describe('KeyValues3', () => {
    test('Check KeyValues3 FeatureObject', async () => {
        const root = await KeyValues3.Load(join(__dirname, 'KeyValues3_subclass.txt'));
        expect(root.toString()).toMatchSnapshot();
    });
});
