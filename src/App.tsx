import React, {useState, Suspense} from 'react';
import {
    BrowserRouter,
    Route,
    Routes,
    useLocation
} from 'react-router-dom';

import Authorize, {AUTH_REDIRECT_URI} from "./auth";
import {converter as convert} from "./libs/converter";
import {ThemeProvider} from "./Theme";
import Users from "./pages/Users";
import {GlobalProvider} from "./Global";
import initIntegration from "./integrations/init";
import {fetchJson} from "./libs/fetch";
import Alert from "./components/Alert";

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

type GoogleOAuth2 = {
    client_id: string;
};

type GoogleServiceAccount = {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
} | null;

type DropboxConfig = {
    clientId: string;
    rootPath: string;
} | null;

type AIConfig = {
    geminiApiKey?: string;
    chatGptApiKey?: string;
} | null;

type MenuConfig = {
    [key: string]: {
        title: string;
        icon?: string;
        path?: string;
        page?: React.ComponentType;
        layout?: React.ComponentType;
    }[];
};

type Config = {
    firebase: FirebaseConfig;
    google: {
        oAuth2: GoogleOAuth2;
        serviceAccount?: GoogleServiceAccount;
    };
    dropbox?: DropboxConfig;
    ai?: AIConfig;
    tenantsURI?: string;
    proxyURI?: string;
};

type AppProps = {
    importPage: (pagesPath: string) => Promise<{ default: React.ComponentType }>;
    importTheme?: () => Promise<{ default: { theme: object } }> | null;
    LayoutDefault?: React.ComponentType | null;
    firebaseConfig: FirebaseConfig;
    oAuth2: GoogleOAuth2;
    serviceAccount?: GoogleServiceAccount;
    dropBoxConfig?: DropboxConfig;
    aiConfig?: AIConfig;
    tenantsURI?: string;
    proxyURI?: string;
    menuConfig: MenuConfig;
}

let tenants = null;
let config: Config | null = null;
let menu = {};

function App({
                 importPage,
                 importTheme        = null,
                 LayoutDefault      = null,
                 firebaseConfig,
                 oAuth2,
                 serviceAccount     = null,
                 dropBoxConfig      = null,
                 aiConfig           = null,
                 tenantsURI         = null,
                 proxyURI           = null,
                 menuConfig         = {},
}: AppProps) {
    initTenant(firebaseConfig, oAuth2, serviceAccount, dropBoxConfig, aiConfig, tenantsURI, proxyURI);
    initMenu(menuConfig);
    initIntegration(config);

    const LayoutEmpty = ({ children }) => <>{children}</>;

    function getRoute(key, item, index) {
        const pageSource = item.path === "/" ? "Home" : convert.toCamel(item.path);
        const PageComponent = item.page || React.lazy(() =>
            importPage(pageSource).catch(() =>
                Promise.resolve({
                    default: () => <Alert type="warning">Missing Page {`pages/${pageSource}.js`}</Alert>
                })
            )
        );

        const LayoutComponent = item.layout || LayoutDefault || LayoutEmpty;
        return (
            <Route
                key={`${key}-${index}`}
                path={item.path}
                element={
                    <LayoutComponent>
                        <Suspense fallback={<div>Loading...</div>}>
                            <PageComponent />
                        </Suspense>
                    </LayoutComponent>
                }
            />
        );
    }

    const renderRoutes = (menuObject) =>
        Object.keys(menuObject).flatMap(key =>
            menuObject[key].flatMap((item, index) => [
                item.path && getRoute(key, item, index),
                item.children && renderRoutes({children: item.children})
            ].filter(Boolean))
        );

    return (
        <BrowserRouter>
            <GlobalProvider>
                <ThemeProvider importTheme={importTheme}>
                    <Routes>
                        <Route path={AUTH_REDIRECT_URI} element={<Authorize />}></Route>
                        <>
                        {renderRoutes({default: [{ path: "/" }], ...{
                            ...menu,
                            _auth: [{
                                path: "/users",
                                page: Users,
                                layout: LayoutDefault
                            }]
                        }})}
                        </>
                    </Routes>
                </ThemeProvider>
            </GlobalProvider>
        </BrowserRouter>
    );
}

const initTenant = (firebaseConfig, oAuth2, serviceAccount, dropBoxConfig, aiConfig, tenantsURI, proxyURI) => {
    const setTenant = () => {
        const tenant = {firebaseConfig, oAuth2, serviceAccount, dropBoxConfig, aiConfig, tenantsURI, proxyURI};
        localStorage.setItem("tenant", JSON.stringify(tenant));
        return tenant;
    }

    config = JSON.parse(localStorage.getItem("tenant")) || setTenant();
}
const initMenu = (menuConfig) => {
    menu = menuConfig;
}

export const useTenants = (setTenants) => {
    const clickTenant = (tenant, index = null) => {
        //todo probabilmente sbagliato. da gestire il cambio del config eccS
        initIntegration(tenant);

        if (tenants && index !== null) {
            setTenants(tenants.map((tenant, i) => {
                tenant.active = (i === index + 1);
                return tenant;
            }));
        }
        console.log("change project", tenant);
    }

    if(!config?.tenantsURI) return;

    if(!tenants) {
        fetchJson(config.tenantsURI).then(response => {
            tenants = response
                .filter(tenant => tenant.title)
                .map((tenant, index) => ({
                        title: tenant.name,
                        icon: "folder",
                        active: (tenant.appId === config?.firebase?.appId),
                        onClick: () => clickTenant(tenant, index)
                    })
                );
        }).catch(error => {
            console.error('Error: Tenants not found ' + config?.tenantsURI, error);
            tenants = [];
        }).finally(() => {
            setTenants(tenants);
        });
    } else {
        setTenants(tenants);
    }
}

export const useMenu = (type) => {
    const menuInfo = menu[type] || [];
    const location = useLocation();
    const [activeId, setActiveId] = useState(() => {
        for (let i = 0; i < menuInfo.length; i++) {
            if (location.pathname === menuInfo[i]?.path
                || (menuInfo[i]?.path !== "/" && location.pathname.startsWith(menuInfo[i]?.path))
            ) {
                return i;
            }
        }
        return -1;
    });


    return menuInfo.filter(item => item.title)
        .map((item, index) => ({
            ...item,
            active: index === activeId,
            onClick: () => setActiveId(index)
        }));
}

export const configProvider = () => {
    return config;
}

export default App;
