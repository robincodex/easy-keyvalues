import { readFileSync } from 'fs';
import { join } from 'path';
import { LoadKeyValues, LoadKeyValues3 } from '../src/web';

describe('Browser', () => {
    test('Check KeyValues', () => {
        const body = readFileSync(join(__dirname, 'KeyValues.txt'), 'utf8');
        const root = LoadKeyValues(body);
        expect(root.IsRoot()).toBe(true);
    });
    test('Check KeyValues3', () => {
        const body = readFileSync(join(__dirname, 'KeyValues3.txt'), 'utf8');
        const root = LoadKeyValues3(body);
        expect(root.IsRoot()).toBe(true);
    });
});
