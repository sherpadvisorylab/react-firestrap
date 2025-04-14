// scripts/cli/setup-project.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = process.cwd();

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

function askInteractive(callback) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const defaultName = path.basename(process.cwd());

    rl.question(`What is your project name? (default: ${defaultName}) `, (projectInput) => {
        const projectName = projectInput.trim() || defaultName;

        rl.question(`Do you want to use Firebase Hosting?\nLeave blank to use "${defaultName}" as hosting name, type 'n' to disable hosting, or provide a custom name: `, (hostingInput) => {
            const hostingAnswer = hostingInput.trim();
            rl.close();
            callback(projectName, hostingAnswer);
        });
    });
}

function createDirectories() {
    ['conf', 'layouts', 'pages', 'sections'].forEach(dir =>
        ensureDir(path.join(root, `src/${dir}`))
    );

    ['css', 'fonts', 'images', 'js'].forEach(dir =>
        ensureDir(path.join(root, `public/assets/${dir}`))
    );

    // CSS placeholders
    ensureFile(path.join(root, 'public/assets/css/app.min.css'), '// Placeholder for app.min.css');

    // JS placeholders
    ensureFile(path.join(root, 'public/assets/js/app.min.js'), '// Placeholder for app.min.js');
}

function createSidebarComponent() {
    const content = `import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useTheme, useMenu } from "react-firestrap";

let isSidebarHidden = false;
const Sidebar = () => {
  const theme = useTheme("sidebar");
  const menuSidebar = useMenu("sidebar");

  return (
    <nav className="pc-sidebar bg-light border-end vh-100">
      <div className="navbar-wrapper">
        <div className="m-header p-3 border-bottom">
          <a href="/" className="b-brand text-primary position-relative d-block text-decoration-none">
            <img src="/assets/images/logo-white.svg" alt="logo" className="logo-lg" height={32} />
          </a>
        </div>
        <div className="navbar-content p-3">
          <ul className="pc-navbar list-unstyled">
            {menuSidebar.map((item, index) => !item.path
              ? <li className="pc-item pc-caption" key={index}>
                  {item.title === "true" ? <hr /> : <label>{item.title}</label>}
                </li>
              : <li
                  key={index}
                  className={"pc-item nav-item" + (item.active ? " active" : "")}
                  onClick={item.onClick}
                >
                  <Link to={item.path} className="pc-link nav-link d-flex align-items-center">
                    <span className="pc-micon me-2">
                      <i className={theme.getIcon(item.icon)}></i>
                    </span>
                    <span className="pc-mtext flex-grow-1">{item.title}</span>
                    <span className="pc-arrow"></span>
                  </Link>
                </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export const SidebarToggler = () => {
  const theme = useTheme("sidebar");
  const [isSidebarAvailable, setIsSidebarAvailable] = useState(false);

  const toggleSidebar = () => {
    isSidebarHidden = !isSidebarHidden;
    window.dispatchEvent(new Event('sidebar-toggle'));
  };

  useEffect(() => {
    const sidebarElement = document.querySelector('.pc-sidebar');
    if (sidebarElement) {
      setIsSidebarAvailable(true);
      const handleSidebarToggle = () => {
        sidebarElement.classList.toggle('pc-sidebar-hide', isSidebarHidden);
      };
      window.addEventListener('sidebar-toggle', handleSidebarToggle);
      return () => {
        window.removeEventListener('sidebar-toggle', handleSidebarToggle);
      };
    }
  }, []);

  return (<>
    {isSidebarAvailable && <ul className="list-unstyled">
      <li className="pc-h-item pc-sidebar-collapse">
        <button className="pc-head-link ms-0 btn" onClick={toggleSidebar}>
          <i className={theme.getIcon("list")}></i>
        </button>
      </li>
      <li className="pc-h-item pc-sidebar-popup">
        <button className="pc-head-link ms-0 btn" onClick={toggleSidebar}>
          <i className={theme.getIcon("list")}></i>
        </button>
      </li>
    </ul>}
  </>);
};

export default Sidebar;
`;
    ensureFile(path.join(root, 'src/sections/Sidebar.js'), content);
}

function createHeaderComponent() {
    const content = `import React from 'react';

function Header() {
  return (
    <div className="section header">
      {/* Header component */}
    </div>
  );
}

export default Header;
`;
    ensureFile(path.join(root, 'src/sections/Header.js'), content);
}

function createPageHeaderComponent() {
    const content = `import React from 'react';

function PageHeader() {
  return (
    <div className="section pageheader">
      {/* PageHeader component */}
    </div>
  );
}

export default PageHeader;
`;
    ensureFile(path.join(root, 'src/sections/PageHeader.js'), content);
}

function createFooterComponent() {
    const content = `import React from 'react';

function Footer() {
  return (
    <div className="section footer">
      {/* Footer component */}
    </div>
  );
}

export default Footer;
`;
    ensureFile(path.join(root, 'src/sections/Footer.js'), content);
}

function createPreLoaderComponent() {
    const content = `import React from 'react';

function PreLoader() {
  return (
    <div className="section preloader">
      {/* PreLoader component */}
    </div>
  );
}

export default PreLoader;
`;
    ensureFile(path.join(root, 'src/sections/PreLoader.js'), content);
}

function createSectionComponents() {
    createSidebarComponent();
    createHeaderComponent();
    createPageHeaderComponent();
    createFooterComponent();
    createPreLoaderComponent();
}

function createHomePage() {
    const content = `import React from 'react';

function Home() {
  return (
    <div className="page home">
      <h1>Welcome to your new React FireStrap project!</h1>
    </div>
  );
}

export default Home;
`;
    ensureFile(path.join(root, 'src/pages/Home.js'), content);
}

function createEnvFile() {
    ensureFile(path.join(root, '.env'), `
# 🔐 Firebase Config
REACT_APP_FIREBASE_APIKEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

# 🧩 OAuth & Dropbox
REACT_APP_GOOGLE_CLIENT_ID=
REACT_APP_GOOGLE_SCOPE='https://www.googleapis.com/auth/doubleclicksearch https://www.googleapis.com/auth/analytics'

REACT_APP_DROPBOX_CLIENT_ID=
REACT_APP_DROPBOX_CLIENT_SECRET=
REACT_APP_DROPBOX_BASE_PATH=
  `);
}

function createFirebaseConfig(projectName, hostingAnswer) {
    ensureFile(path.join(root, '.firebaserc'), `
{
  "projects": {
    "default": "${projectName}"
  }
}
  `);

    const includeHosting = hostingAnswer.toLowerCase() !== 'n';
    const hostingSite = hostingAnswer === '' ? projectName : hostingAnswer;

    const firebaseJson = {
        database: {
            rules: "database.rules.json"
        },
        ...(includeHosting && {
            hosting: {
                site: hostingSite,
                public: "build",
                ignore: [
                    "firebase.json",
                    "**/.*",
                    "**/node_modules/**"
                ],
                predeploy: ["npm run build"],
                rewrites: [
                    {
                        source: "**",
                        destination: "/index.html"
                    }
                ]
            }
        })
    };

    ensureFile(path.join(root, 'firebase.json'), JSON.stringify(firebaseJson, null, 2));

    ensureFile(path.join(root, 'database.rules.json'), `{
  "rules": {
    ".read": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() && (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' || root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'user')",
    ".write": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() && (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' || root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'user')",
    "users": {
      ".read": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists()",
      ".write": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin'",
      ".indexOn": ["role"]
    },
    "reviews": {
      ".read": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() && (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' || root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'reviewer')",
      ".write": "auth != null && root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).exists() && (root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'admin' || root.child('users').child(auth.email.replace('.', '-').replace('@', '-')).child('permission').val() === 'reviewer')"
    }
  }
}`);

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

function createIndexHtml() {
    const vendorCssPath = path.join(root, 'public/assets/css/vendor.min.css');
    const vendorJsPath = path.join(root, 'public/assets/js/vendor.min.js');

    const vendorCssHref = fs.existsSync(vendorCssPath)
        ? '/assets/css/vendor.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';

    const vendorJsSrc = fs.existsSync(vendorJsPath)
        ? '/assets/js/vendor.min.js'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';


    ensureFile(path.join(root, 'public/index.html'), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My React App</title>
  <link rel="stylesheet" href="${vendorCssHref}" />
  <link rel="stylesheet" href="/assets/css/app.min.css" />
  <script defer src="${vendorJsSrc}"></script>
  <script defer src="/assets/js/app.min.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
  `);
}

function createAppStructureFiles() {
    ensureFile(path.join(root, 'src/index.js'), `
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from 'react-firestrap';
import Default from "./layouts/Default.js";
import { menu } from "./conf/menu.js";

const root = createRoot(document.getElementById('root'));
root.render(
    <App
        importPage={(pageSource) => import(\`./pages/\${pageSource}.js\`)}
        importTheme={() => import(\`./theme.js\`)}
        LayoutDefault={Default}
        firebaseConfig={{
            apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
            measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
        }}
        oAuth2={{
            clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            scope: process.env.REACT_APP_GOOGLE_SCOPE
        }}
        dropBoxConfig={{
            clientId: process.env.REACT_APP_DROPBOX_CLIENT_ID,
            rootPath: process.env.REACT_APP_DROPBOX_BASE_PATH
        }}
        menuConfig={menu}
    />
);
  `);

    ensureFile(path.join(root, 'src/App.js'), `
import React from 'react';
import { Gui } from 'react-firestrap';
import Default from './layouts/Default.js';
import { menu } from './conf/menu.js';

function App() {
    return (
        <Gui
            layoutDefault={Default}
            menuConfig={menu}
            importPage={(pageSource) => import(\`./pages/\${pageSource}.js\`)}
            importTheme={() => import(\`./theme.js\`)}
        />
    );
}

export default App;
  `);

    ensureFile(path.join(root, 'src/theme.js'), `
export const theme = {}
  `);

    ensureFile(path.join(root, 'src/layouts/Default.js'), `
import React from 'react';
import Sidebar from "../sections/Sidebar.js";
import Header from "../sections/Header.js";
import PageHeader from "../sections/PageHeader.js";
import Footer from "../sections/Footer.js";
import PreLoader from "../sections/PreLoader.js";

function Default({children}) {
    return (
        <div className="app" id="app">
            <PreLoader />
            <Sidebar/>
            <Header/>
            <div className={"pc-container"}>
                <div className={"pc-content"}>
                    <PageHeader/>
                    {children}
                </div>
            </div>
            <Footer/>
        </div>
    );
}

export default Default;
  `);

    ensureFile(path.join(root, 'src/conf/menu.js'), `
export const menu = {
    "sidebar": [],
    "profile": [
        { "title": "USERS", "icon": "users", "path": "/users" }
    ],
    "pages": []
};
  `);
}

function scaffoldProject() {
    askInteractive((projectName, hostingAnswer) => {
        console.log(`\n🚧 Creating project structure for: ${projectName}\n`);
        createDirectories();
        createSectionComponents();
        createHomePage();
        createEnvFile();
        createFirebaseConfig(projectName, hostingAnswer);
        createIndexHtml();
        createAppStructureFiles();
        console.log(`\n✅ Project "${projectName}" created successfully!`);
    });
}

module.exports = { scaffoldProject };
