import { readFileSync } from 'fs';
import { join } from 'path';
import { LoadKeyValues, LoadKeyValues3 } from '../src/web';
import { createServer, Server } from 'http';
import { URL } from 'url';

describe('Browser', () => {
    let server: Server;
    beforeAll((done) => {
        server = createServer((req, res) => {
            const url = new URL(req.url || '', getPath(''));
            res.setHeader('Content-Type', 'text/plain');
            if (url.pathname === '/kv') {
                const body = readFileSync(join(__dirname, 'KeyValues.txt'), 'utf8');
                res.write(body);
            } else if (url.pathname === '/kv3') {
                const body = readFileSync(join(__dirname, 'KeyValues3.txt'), 'utf8');
                res.write(body);
            }
            res.end();
        });
        server.listen(0, '127.0.0.1', done);
    });

    afterAll((done) => {
        server.close(done);
    });

    function getPath(pathname: string): string {
        const addr = server.address();
        if (!addr) {
            throw Error('No address');
        }
        if (typeof addr === 'string') {
            return addr;
        } else {
            return `http://${addr.address}:${addr.port}${pathname}`;
        }
    }

    test('Check KeyValues', async () => {
        const root = await LoadKeyValues(getPath('/kv'), {
            responseType: 'text',
            proxy: false,
        });
        expect(root.IsRoot()).toBe(true);
    });
    test('Check KeyValues3', async () => {
        const root = await LoadKeyValues3(getPath('/kv3'), {
            responseType: 'text',
            proxy: false,
        });
        expect(root.IsRoot()).toBe(true);
    });
});
