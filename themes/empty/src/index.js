import React from "react";
import { createRoot } from "react-dom/client";
import { App } from 'react-firestrap';
import Default from "./layouts/Default.js";
import { menu } from "./conf/menu.js";

const root = createRoot(document.getElementById('root'));
root.render(
    <App
        importPage={(pageSource) => import(`${pageSource}`)}
        importTheme={() => import(`./theme.js`)}
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
        aiConfig={{
            geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
            chatGptApiKey: process.env.REACT_APP_CHATGPT_API_KEY,
            deepSeekApiKey: process.env.REACT_APP_DEEPSEEK_API_KEY,
        }}
        menuConfig={menu}
    />
);
  