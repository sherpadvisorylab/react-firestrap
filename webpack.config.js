const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        chunkFilename: '[name].bundle.js', // Import dinamico genera bundle separati
        libraryTarget: 'commonjs2',
        sourceMapFilename: '[file].map',
    },
    mode: 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    externals: [
        nodeExternals(),
        {
            react: 'react',
            'react-dom': 'react-dom',
            'react-router-dom': 'react-router-dom',
            firebase: 'firebase'
        }
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/, // Modifica qui per includere i file .ts e .tsx
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader', // Usa ts-loader per gestire i file TypeScript
                },
            },
            {
                test: /\.(js|jsx)$/, // Regola per i file JavaScript
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
    ],
};
