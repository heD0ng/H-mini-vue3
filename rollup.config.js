// 解析ts
import ts from 'rollup-plugin-typescript2'; 
import json from '@rollup/plugin-json'; 
// 解析第三方插件
import resolvePlugin from '@rollup/plugin-node-resolve';
import path from 'path';

const pkgPath = path.resolve(__dirname, 'packages')
const targetPath = path.resolve(pkgPath, process.env.TARGET);
const name = path.basename(targetPath)

const pkg = require(path.resolve(targetPath, 'package.json'));


const outputOptions = {
    "esm-bundler": {
        file: path.resolve(targetPath, `dist/${name}.esm-bundler.js`),
        format:'es'
    },
    "cjs": {
        file: path.resolve(targetPath, `dist/${name}.cjs.js`),
        format:'cjs'
    },
    "global": {
        file: path.resolve(targetPath, `dist/${name}.global.js`),
        format:'iife'
    }
}

const buildOptions = pkg.buildOptions || {};
console.log('buildOptions',targetPath, buildOptions);
const createConfig = (item, output) => {
    output.name = buildOptions.name;
    output.sourcemap = true;
    return {
        input: path.resolve(targetPath, 'src/index.ts'),
        output: {
            ...output
        },
        plugins:[
            json(),
            ts({
                tsconfig: path.resolve(__dirname, 'tsconfig.json')
            }),
            resolvePlugin()
        ]
    }
}

export default buildOptions.formats.map((item) => {
    return createConfig(item, outputOptions[item])
})
