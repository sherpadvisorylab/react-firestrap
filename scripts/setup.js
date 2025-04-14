// postinstall.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const mainProjectPath = path.resolve(__dirname, '../'); // Modifica il percorso se necessario

function installDependencies() {
    console.log('Installing React and Webpack in the main project...');
    execSync('npm install react webpack webpack-cli --save-dev', {
        stdio: 'inherit',
        cwd: mainProjectPath
    });
}

function createWebpackConfig() {
    const webpackConfig = `
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    resolve: {
        alias: {
            @pages: path.resolve(__dirname, 'src/pages'), // Modifica l'alias come desideri
        },
    },
    // ... aggiungi altre configurazioni se necessario
};
`;

    fs.writeFileSync(path.join(mainProjectPath, 'webpack.config.js'), webpackConfig.trim());
}

function run() {
    console.log("🔧 Esecuzione dello scaffolder di React FireStrap...");

    installDependencies();
    createWebpackConfig();
}

run();
