const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Cartella creata: ${dirPath}`);
    }
}

function ensureFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content.trimStart());
        console.log(`📄 File creato: ${filePath}`);
    }
}

function askProjectName(callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const defaultName = path.basename(process.cwd());

    rl.question(`Come vuoi chiamare il tuo progetto? (default: ${defaultName}) `, (input) => {
        const projectName = input.trim() || defaultName;
        rl.close();
        callback(projectName);
    });
}

function scaffoldProject() {
    askProjectName((projectName) => {
        console.log(`\n🚧 Sto creando la struttura per: ${projectName}\n`);

        // ⬇️ qui sotto va tutto il contenuto che già hai, ma...
        // sostituisci "[projectname]" con il valore `projectName`
        ensureFile(path.join(root, '.firebaserc'), `
{
  "projects": {
    "default": "${projectName}"
  }
}
        `);

        ensureFile(path.join(root, 'firebase.json'), `
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "site": "${projectName}",
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "predeploy": ["npm run build"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
        `);

        // 🔁 tutto il resto resta invariato (src/, public/, .env, App.js, index.js, ecc.)
        // ➕ Se vuoi, puoi passare anche `projectName` come parametro ad altri file se necessario

        console.log(`\n✅ Progetto "${projectName}" creato con successo!`);
    });
}

module.exports = { scaffoldProject };
