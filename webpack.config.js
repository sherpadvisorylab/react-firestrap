const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        chunkFilename: '[name].bundle.js', // Import dinamico genera bundle separati
        libraryTarget: 'commonjs2',
        sourceMapFilename: '[file].map',
    },
    mode: 'development',
    devtool: 'source-map', // Attiva la generazione dei sourcemaps
    externals: [nodeExternals()], // Esclude le dipendenze dal bundle di output
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
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
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env), // Espone tutte le variabili d'ambiente
        }),
    ],
};
