// @ts-nocheck
const path = require('path')
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
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [

    ]
}