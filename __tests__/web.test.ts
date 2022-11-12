import { readFileSync } from 'fs';
import { join } from 'path';
import { KeyValues, KeyValues3, setKeyValuesAdapter } from '../src/web';
import { createServer, Server } from 'http';
import { URL } from 'url';
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { readFile } from 'fs/promises';

describe('Browser', () => {
    beforeAll((done) => {
        setKeyValuesAdapter({
            async readFile(path) {
                if (path === 'http://localhost/kv') {
                    return `"DOTAAbilities" {}`;
                } else if (path === 'http://localhost/kv3') {
                    return `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
                    {
                    }`;
                }
                return '';
            },
            async writeFile(path, data) {},
            createKeyValuesID() {
                return '';
            },
            resolvePath(filename, basePath) {
                return '';
            },
        });
        done();
    });

    test('Check KeyValues', async () => {
        const root = await KeyValues.Load('http://localhost/kv');
        expect(root.IsRoot()).toBe(true);
    });
    test('Check KeyValues3', async () => {
        const root = await KeyValues3.Load('http://localhost/kv3');
        expect(root.IsRoot()).toBe(true);
    });
});
