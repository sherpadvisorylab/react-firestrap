#!/usr/bin/env node

const path = require('path');
const [,, cmd] = process.argv;

switch (cmd) {
    case 'setup':
        require(path.join(__dirname, '../scripts/setup.js'));
        break;

    case 'help':
    default:
        console.log(`
✨ React FireStrap CLI ✨

Comandi disponibili:

  setup     - Crea una configurazione base (React + Webpack)
  help      - Mostra questo messaggio

Usa: npx react-firestrap <comando>
        `);
        break;
}
