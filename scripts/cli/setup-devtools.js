const fs = require('fs');
const path = require('path');

const root = process.cwd();

function ensureFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content.trimStart());
        console.log(`📄 File creato: ${filePath}`);
    }
}

function setupDevTools() {
    console.log('🛠️  Setup Webpack + Babel + TSConfig');

    // tsconfig.json
    ensureFile(path.join(root, 'tsconfig.json'), `
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "jsx": "react",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "baseUrl": "./src",
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationDir": "./dist/types"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
    `);

    // webpack.config.js
    ensureFile(path.join(root, 'webpack.config.js'), `
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@pages': path.resolve(__dirname, 'src/pages')
    }
  },
  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  devtool: 'source-map'
};
    `);

    // .babelrc
    ensureFile(path.join(root, '.babelrc'), `
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread"
  ]
}
    `);
}

module.exports = { setupDevTools };
