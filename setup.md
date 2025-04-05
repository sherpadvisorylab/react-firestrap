# 🛠️ React FireStrap – Guida completa per sviluppo locale + CLI `npx react-firestrap`

Questa guida ti aiuta a:

- Lavorare su `react-firestrap` localmente
- Collegarlo a un progetto esterno (`d2uno.app`) tramite `npm link`
- Usare il CLI manuale: `npx react-firestrap setup`
- Pulire ambienti e testare modifiche in tempo reale

---

## ✅ 1. Pulizia del pacchetto `react-firestrap`

```bash
cd react-firestrap
npm unlink react-firestrap --no-save
rm -rf node_modules package-lock.json
```

---

## ✅ 2. Reinstalla le dipendenze (senza lock)

```bash
npm install --no-package-lock

```

👉 Questo assicura che vengano installate **solo le dipendenze dichiarate** (`peerDependencies` restano esclusi, come giusto che sia).

---

## ✅ 3. Compila la libreria

```bash
npm run build
rm -rf node_modules/react-*
```

Assicurati che vengano generati:

- `dist/index.js`
- `dist/types/index.d.ts`

---

## ✅ 4. Collega il pacchetto globalmente via `npm link`

```bash
npm link
```

Questo crea un symlink globale del pacchetto, visibile da altri progetti.

---

## ✅ 5. Vai nel progetto che lo usa (es. `d2uno.app`) e collega il pacchetto

```bash
cd ../d2uno.app
npm unlink react-firestrap --no-save
npm link react-firestrap
```

Ora `react-firestrap` sarà incluso in `node_modules` di `d2uno.app` come symlink.

---

## ✅ 6. Esegui il CLI di scaffolding (manuale)

```bash
npx react-firestrap help
npx react-firestrap setup
```

Se hai configurato correttamente `bin/cli.js`, vedrai un messaggio CLI personalizzato.

---

## ✅ 7. Struttura CLI nel pacchetto `react-firestrap`

```
react-firestrap/
├── bin/
│   └── cli.js          # entrypoint CLI, eseguito da `npx react-firestrap`
├── scripts/
│   └── setup.js        # contiene lo script di scaffolding
├── src/
│   └── index.ts
├── dist/
│   ├── index.js
│   └── types/
├── package.json
└── ...
```

Nel tuo `package.json` deve essere presente:

```json
"bin": {
  "react-firestrap": "./bin/cli.js"
}
```

E in `bin/cli.js`:

```js
#!/usr/bin/env node

const [,, cmd] = process.argv;

switch (cmd) {
  case 'setup':
    require('../scripts/setup');
    break;
  case 'help':
  default:
    console.log(\`
✨ React FireStrap CLI ✨

Comandi disponibili:

  setup     - Crea una configurazione base (React + Webpack)
  help      - Mostra questo messaggio

Usa: npx react-firestrap <comando>
    \`);
    break;
}
```

---

## 🧼 Extra – Reset/Unlink se qualcosa va storto

### 🔁 Da `d2uno.app` (per scollegare il pacchetto):

```bash
npm unlink react-firestrap --no-save
```

### 🔁 Da `react-firestrap` (per eliminare il symlink globale):

```bash
npm unlink
```

---

## 🚀 Quando pubblichi su npm

Una volta pubblicato, chiunque potrà usare:

```bash
npx react-firestrap setup
```

Anche senza `npm install` preliminare!

---

## 📌 Suggerimenti

- Puoi evolvere il CLI usando librerie come `commander`, `yargs`, `inquirer` per aggiungere interattività (`--typescript`, `--vite`, ecc.)
- Ricorda di mettere `react`, `react-dom`, ecc. in `peerDependencies` e non in `dependencies` del pacchetto

---

✅ Pronto! Hai un pacchetto React modulare con CLI integrato, usabile sia localmente che via NPM!
