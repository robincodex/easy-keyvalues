import rollupTypescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { join } from 'path';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import p from './package.json';

const external = Object.keys(p.dependencies);

module.exports = [
    {
        input: 'src/node.ts',
        output: {
            file: 'package/node.js',
            sourcemap: true,
            format: 'cjs',
        },
        external,
        plugins: [
            rollupTypescript(require('./tsconfig.json').compilerOptions),
            commonjs({ extensions: ['.js', '.ts'] }),
            nodeResolve(),
        ],
    },
    {
        input: 'src/web.ts',
        output: {
            name: 'web.js',
            file: 'package/web.js',
            sourcemap: true,
            format: 'umd',
            globals: { axios: 'axios', nanoid: 'nanoid' },
        },
        external,
        plugins: [
            rollupTypescript({
                exclude: ['src/node.ts'],
                tsconfig: join(__dirname, 'tsconfig.web.json'),
            }),
        ],
    },
    {
        input: 'src/es.ts',
        output: {
            name: 'es.js',
            file: 'package/es.js',
            sourcemap: true,
            format: 'es',
        },
        external,
        plugins: [
            rollupTypescript({
                exclude: ['src/node.ts'],
                tsconfig: join(__dirname, 'tsconfig.json'),
            }),
        ],
    },
];
