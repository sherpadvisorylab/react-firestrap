#!/usr/bin/env node

const [,, cmd] = process.argv;

switch (cmd) {
    case 'create':
        require('../scripts/scaffold-project').scaffoldProject();
        break;

    case 'devtools':
        require('../scripts/setup-devtools').setupDevTools();
        break;

    case 'help':
    default:
        console.log(`
✨ React FireStrap CLI ✨

Comandi disponibili:

  create     - Genera l'intera struttura del progetto (src/, public/, .env ecc.)
  devtools   - Crea solo tsconfig, webpack.config.js, .babelrc
  help       - Mostra questo messaggio

Esempi:
  npx react-firestrap create
  npx react-firestrap devtools
`);
        break;
}
