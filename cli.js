#!/usr/bin/env node

const [,, cmd] = process.argv;

switch (cmd) {
    case 'setup':
        require('../scripts/setup');
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
