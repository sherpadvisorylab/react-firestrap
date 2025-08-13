// scripts/cli/setup-project.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = process.cwd();
const themesDir = path.resolve(__dirname, '../../themes');

const args = process.argv.slice(2);
const shouldReset = args.includes('--reset');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
}

function ensureFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content.trimStart());
        console.log(`📄 Created file: ${filePath}`);
    }
}

function resetProjectDirectory() {
    console.log("🧹 Resetting selected files and folders...");

    const toDelete = [
        'src',
        'public',
        '.env',
        '.firebaserc',
        'database.rules.js',
        'firebase.json',
        'storage.rules'
    ];

    toDelete.forEach(entry => {
        const entryPath = path.join(root, entry);
        if (fs.existsSync(entryPath)) {
            fs.rmSync(entryPath, { recursive: true, force: true });
            console.log(`❌ Removed: ${entryPath}`);
        } else {
            console.log(`⚠️  Skipped (not found): ${entryPath}`);
        }
    });
}

async function askInteractive(callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (text) => new Promise(resolve => rl.question(text, resolve));

    const defaultName = path.basename(root);
    const availableThemes = getAvailableThemes();
    const themeList = availableThemes.length > 0 ? availableThemes.join(', ') : 'none';
    const bootstrapColors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    const defaultColor = 'dark';

    try {
        const projectnameInput = await question(`What is your project name? (default: ${defaultName}) `);
        const projectname = projectnameInput.trim() || defaultName;

        const themeInput = await question(`Which theme do you want to use? (available: ${themeList}, default: "default") `);
        const theme = themeInput.trim() || 'default';

        const bgInput = await question(`Which Bootstrap background color? (${bootstrapColors.join(', ')}, default: "${defaultColor}") `);
        const background = bootstrapColors.includes(bgInput.trim()) ? bgInput.trim() : defaultColor;

        const hostingInput = await question(`Do you want to use Firebase Hosting?\nLeave blank to use "${defaultName}" as hosting name, type 'n' to disable hosting, or provide a custom name: `);
        const hosting = hostingInput.trim();

        const firebase = {};
        
        const firebaseApikeyInput = await question(`What is your Firebase Apikey: `);
        firebase.apikey = firebaseApikeyInput.trim();
        const firebaseAuthDomainInput = await question(`What is your Firebase Auth Domain: `);
        firebase.authDomain = firebaseAuthDomainInput.trim();
        const firebaseDBUrlInput = await question(`What is your Firebase Database Url: `);
        firebase.dbUrl = firebaseDBUrlInput.trim();
        const firebaseProjIdInput = await question(`What is your Firebase Project ID: `);
        firebase.projId = firebaseProjIdInput.trim();
        const firebaseMessSenderIdInput = await question(`What is your Firebase Messaging Sender ID: `);
        firebase.messSenderId = firebaseMessSenderIdInput.trim();
        const firebaseAppIdInput = await question(`What is your Firebase App ID: `);
        firebase.appId = firebaseAppIdInput.trim();
        const firebaseMeasurementIdInput = await question(`What is your Firebase Measurement ID: `);
        firebase.measurementId = firebaseMeasurementIdInput.trim();
        const firebaseGoogleClientIdInput = await question(`What is your Google Client ID: `);
        firebase.googleClientId = firebaseGoogleClientIdInput.trim();

        rl.close();

        const params = {
            projectname,
            hosting,
            theme,
            background,
            firebase
        };

        callback(params);
    } catch (error) {
        rl.close();
        console.error('❌ Error during interactive prompt:', error);
    }
}

function getAvailableThemes() {
    if (!fs.existsSync(themesDir)) return [];
    return fs.readdirSync(themesDir).filter(name =>
        fs.statSync(path.join(themesDir, name)).isDirectory()
    );
}

function copyAndReplace(fromPath, toPath, replacements = {}) {
    if (!fs.existsSync(fromPath)) return;

    fs.readdirSync(fromPath).forEach(file => {
        const srcFile = path.join(fromPath, file);
        const destFile = path.join(toPath, file);

        if (fs.statSync(srcFile).isDirectory()) {
            ensureDir(destFile);
            copyAndReplace(srcFile, destFile, replacements);
        } else {
            ensureDir(path.dirname(destFile));

            const ext = path.extname(file).toLowerCase();
            const isBinary = ['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext);

            if (isBinary) {
                fs.copyFileSync(srcFile, destFile);
            } else {
                let content = fs.readFileSync(srcFile, 'utf8');
                for (const [key, value] of Object.entries(replacements)) {
                    content = content.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
                }
                fs.writeFileSync(destFile, content);
            }

            console.log(`📄 Copied file: ${destFile}`);
        }
    });
}


function applyTheme(params) {
    const themesAvailable = getAvailableThemes();
    const finalTheme = themesAvailable.includes(params.theme) ? params.theme : 'empty';
    const themePath = path.join(themesDir, finalTheme);
    console.log(`🎨 Using theme: "${finalTheme}"`);
    copyAndReplace(themePath, root, {
        projectname: params.projectname,
        background: params.background
    });
}

function createEnvFile(params) {
    ensureFile(path.join(root, '.env'), `
# 🔐 Firebase Config (required)
REACT_APP_FIREBASE_APIKEY='${params.firebase.apikey}'
REACT_APP_FIREBASE_AUTH_DOMAIN='${params.firebase.authDomain}'
REACT_APP_FIREBASE_PROJECT_ID='${params.firebase.projId}'
REACT_APP_FIREBASE_MESSAGING_SENDER_ID='${params.firebase.messSenderId}'
REACT_APP_FIREBASE_APP_ID='${params.firebase.appId}'
REACT_APP_FIREBASE_MEASUREMENT_ID='${params.firebase.measurementId}'

# 📦 Database (required)
REACT_APP_FIREBASE_DATABASE_URL='${params.firebase.dbUrl}'

# 📦 Storage (optional)
REACT_APP_FIREBASE_STORAGE_BUCKET=

# 🧩 OAuth (required)
REACT_APP_GOOGLE_CLIENT_ID='${params.firebase.googleClientId}'
REACT_APP_GOOGLE_SCOPE='https://www.googleapis.com/auth/doubleclicksearch https://www.googleapis.com/auth/analytics'

# 🧩 Dropbox (optional)
REACT_APP_DROPBOX_CLIENT_ID=
REACT_APP_DROPBOX_CLIENT_SECRET=
REACT_APP_DROPBOX_BASE_PATH=

# 🧩 AI (optional)
REACT_APP_GEMINI_API_KEY=
REACT_APP_OPENAI_API_KEY=
REACT_APP_DEEPSEEK_API_KEY=
REACT_APP_ANTHROPIC_API_KEY=
REACT_APP_MISTRAL_API_KEY=

# 🧩 Scrape (optional)
REACT_APP_SERPAPI_API_KEY=

  `);
}

function createFirebaseConfig(params) {
    const firebaserc = {
        projects: {
            default: params.projectname
        }
    };
    ensureFile(path.join(root, '.firebaserc'), JSON.stringify(firebaserc, null, 2));

    const includeHosting = params.hosting.toLowerCase() !== 'n';
    const hostingSite = params.hosting === '' ? params.projectname : params.hosting;

    const firebaseJson = {
        database: { rules: "database.rules.json" },
        ...(includeHosting && {
            hosting: {
                site: hostingSite,
                public: "build",
                ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
                predeploy: ["npm run build"],
                rewrites: [{ source: "**", destination: "/index.html" }]
            }
        })
    };

    ensureFile(path.join(root, 'firebase.json'), JSON.stringify(firebaseJson, null, 2));

    const databaseRules = {
        rules: {
            ".read": `auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() &&
      (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' ||
       root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'user')`,
            ".write": `auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() &&
      (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' ||
       root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'user')`,
            users: {
                ".read": `auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists()`,
                ".write": `auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() &&
        root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin'`,
                ".indexOn": ["role"]
            }
        }
    };
    ensureFile(path.join(root, 'database.rules.json'), JSON.stringify(databaseRules, null, 2));

    ensureFile(path.join(root, 'storage.rules'), `
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}`);
}

function scaffoldProject() {
    askInteractive((params) => {
        if (shouldReset) {
            resetProjectDirectory();
        }
        console.log(`\n🚧 Creating project structure for: ${params.projectname}`);
        applyTheme(params);
        createEnvFile(params);
        createFirebaseConfig(params);
        console.log(`\n✅ Project "${params.projectname}" created successfully with theme "${params.theme}"!\n`);
    });
}

module.exports = { scaffoldProject };
