// @ts-nocheck

const path = require('path')
const TypescriptDeclarationPlugin = require('typescript-declaration-webpack-plugin')


const tdPlugin = new TypescriptDeclarationPlugin({
    out: 'graphviz.d.ts'
})
const _mergeDeclarations = tdPlugin.mergeDeclarations
tdPlugin.mergeDeclarations = function (declarationFiles) {
    console.log(Object.keys(declarationFiles))
    return _mergeDeclarations.call(tdPlugin, declarationFiles)
}

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'graphviz.js',
        clean: true,
        library: {
            name: 'graphviz',
            type: 'umd',
        }
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
            { test: /\.wasm$/, type: "asset/inline" },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm'],
    },
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true
    },
    plugins: [

    ]
}