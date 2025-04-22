import React from "react";
import {createRoot} from "react-dom/client";
import {App} from 'react-firestrap';
import Default from "./layouts/Default.js";
import {menu} from "./conf/menu.js";

const root = createRoot(document.getElementById('root'));
root.render(
    <App
        importPage={(pageSource) => import(`./pages/${pageSource}.js`)}
        importTheme={() => import((`./theme.js`))}
        LayoutDefault={Default}
        firebaseConfig={{
            apiKey: "AIzaSyDLAd4hy3naDv7-GFaXjHIzGcuAcf2pzpc",
            authDomain: "d2unoapp.firebaseapp.com",
            databaseURL: "https://d2unoapp-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "d2unoapp",
            storageBucket: "d2unoapp.appspot.com",
            messagingSenderId: "1024454697499",
            appId: "1:1024454697499:web:2d40b0a32e76433f908ebe",
            measurementId: "G-P4780L98J1"
        }}
        oAuth2={{
            clientId: "1024454697499-rtm2g5nu4h2bal1gumlo46pevl3s2dqb.apps.googleusercontent.com"
        }}
        dropBoxConfig={{
            clientId: "rxey0c8fxafi93p",
            rootPath: "/appOrganizer"
        }}
        menuConfig={menu}
    />

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
