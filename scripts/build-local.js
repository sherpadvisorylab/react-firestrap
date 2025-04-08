const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const nodeModulesPath = path.join(process.cwd(), "node_modules");

// Utility: cerca react* e react*_ in node_modules
const listReactFolders = (suffix = "") =>
    fs.readdirSync(nodeModulesPath)
        .filter(name => name.startsWith("react") && name.endsWith(suffix))
        .map(name => ({
            original: path.join(nodeModulesPath, name),
            renamed: suffix === "_"
                ? path.join(nodeModulesPath, name.slice(0, -1)) // da react_ → react
                : path.join(nodeModulesPath, name + "_")       // da react → react_
        }));

function renameFolders(folders) {
    for (const { original, renamed } of folders) {
        if (fs.existsSync(original)) {
            console.log(`🔁 Renaming ${path.basename(original)} → ${path.basename(renamed)}`);
            try {
                fs.renameSync(original, renamed);
            } catch (err) {
                console.warn(`⚠️  Impossibile rinominare ${original}. Ignorato.`);
            }
        }
    }
}

function run(cmd) {
    console.log(`🔧 Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
}

function restoreReactFolders() {
    console.log("🔄 Ripristino delle cartelle react* (se presenti)...");
    try {
        const folders = listReactFolders("_");
        renameFolders(folders); // react_ → react
    } catch (err) {
        console.warn("⚠️  Nessuna cartella da ripristinare o errore ignorato.");
    }
}

function renameReactFolders() {
    console.log("📁 Rinomina cartelle react* per uso con local link...");
    try {
        const foldersToRename = listReactFolders(); // react → react_
        renameFolders(foldersToRename);
    } catch (err) {
        console.warn("⚠️  Impossibile rinominare le cartelle react*.");
    }
}

function main() {
    const args = process.argv.slice(2);
    const forceInstall = args.includes("--force");

    restoreReactFolders();

    if (forceInstall) {
        console.log("💥 --force attivo: reinstallazione da zero...");
        try {
            fs.rmSync(nodeModulesPath, { recursive: true, force: true });
        } catch (err) {
            console.warn("⚠️  Errore durante la rimozione di node_modules (ignorato).");
        }
        run("npm install --no-package-lock");
    }

    console.log("🏗️  Esecuzione build...");
    run("npm run build");

    renameReactFolders();

    console.log("✅ Done!");
}

main();
