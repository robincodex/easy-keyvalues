import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import rollupTypescript from '@rollup/plugin-typescript';
import { join } from 'path';
import dts from 'rollup-plugin-dts';

const external = [];//Object.keys(p.dependencies);

module.exports = [
    // build node
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
    // build node.d.ts
    {
        input: 'src/node.ts',
        output: {
            file: 'package/node.d.ts',
            format: 'esm',
        },
        external,
        plugins: [
            dts.default({
                tsconfig: 'tsconfig.json',
                compilerOptions: { removeComments: false, declaration: true },
            }),
        ],
    },
    // build web
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
    // build web.d.ts
    {
        input: 'src/web.ts',
        output: {
            file: 'package/web.d.ts',
            format: 'esm',
        },
        external,
        plugins: [
            dts.default({
                tsconfig: 'tsconfig.json',
                compilerOptions: { removeComments: false, declaration: true },
            }),
        ],
    },
    // build es module
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
    // build es.d.ts
    {
        input: 'src/es.ts',
        output: {
            file: 'package/es.d.ts',
            format: 'esm',
        },
        external,
        plugins: [
            dts.default({
                tsconfig: 'tsconfig.json',
                compilerOptions: { removeComments: false, declaration: true },
            }),
        ],
    },
];
