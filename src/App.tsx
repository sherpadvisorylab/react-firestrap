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
};

type DropboxConfig = {
    clientId: string;
    rootPath: string;
};

type AIConfig = {
    geminiApiKey?: string;
    chatGptApiKey?: string;
};

interface MenuItem {
    path: string;
    title?: string;
    icon?: string;
    [key: string]: any;
}

interface UseMenuItem extends MenuItem {
    active: boolean;
    onClick: () => void;
}

type MenuConfig = {
    [key: string]:(MenuItem & {
        page?: React.ComponentType;
        layout?: React.ComponentType;
    })[];
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

type TenantConfig = {
    firebaseConfig: FirebaseConfig;
    oAuth2: GoogleOAuth2;
    serviceAccount?: GoogleServiceAccount;
    dropBoxConfig?: DropboxConfig;
    aiConfig?: AIConfig;
    tenantsURI?: string;
    proxyURI?: string;
};

interface Tenant {
    name: string;
    appId: string;
    [key: string]: any;
}

interface TenantItem {
    title: string;
    icon: string;
    active: boolean;
    onClick: () => void;
}

type AppProps = TenantConfig & {
    importPage: (pagesPath: string) => Promise<{ default: React.ComponentType }>;
    importTheme?: () => Promise<{ default: { theme: object } }>;
    LayoutDefault?: React.ComponentType;
    menuConfig: MenuConfig;
};

let tenants: TenantItem[] = [];
let config: Config | null = null;
let menu: Record<string, MenuItem[]> = {};

function App({
                 importPage,
                 importTheme        = undefined,
                 LayoutDefault      = undefined,
                 firebaseConfig,
                 oAuth2,
                 serviceAccount     = undefined,
                 dropBoxConfig      = undefined,
                 aiConfig           = undefined,
                 tenantsURI         = undefined,
                 proxyURI           = undefined,
                 menuConfig         = {},
}: AppProps) {
    initTenant({firebaseConfig, oAuth2, serviceAccount, dropBoxConfig, aiConfig, tenantsURI, proxyURI});
    initMenu(menuConfig);
    initIntegration(config);

    const LayoutEmpty = ({ children }: { children: React.ReactNode }) => <>{children}</>;

    function getRoute(key: string, item: MenuItem, index: number): React.ReactElement {
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

    const renderRoutes = (menuObject: MenuConfig): React.ReactNode[] =>
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

const initTenant = ({
                        firebaseConfig,
                        oAuth2,
                        serviceAccount,
                        dropBoxConfig,
                        aiConfig,
                        tenantsURI,
                        proxyURI,
}: TenantConfig) => {
    const setTenant = (): Config => {
        const tenant: Config = {
            firebase: firebaseConfig,
            google: { oAuth2, serviceAccount },
            dropbox: dropBoxConfig,
            ai: aiConfig,
            tenantsURI,
            proxyURI,
        };
        localStorage.setItem("tenant", JSON.stringify(tenant));
        return tenant;
    };

    const saved = localStorage.getItem("tenant");
    config = saved ? JSON.parse(saved) : setTenant();
}

export const initMenu = (menuConfig: MenuConfig): void => {
    menu = menuConfig;
}

export const useTenants = (setTenants: (tenants: TenantItem[]) => void): void => {
    const clickTenant = (tenant: Config, index: number) => {
        initIntegration(tenant);

        if (tenants) {
            setTenants(
                tenants.map((t, i) => ({
                    ...t,
                    active: i === index, //todo capire perche era index + 1
                }))
            );
        }

        console.log("change project", tenant);
    };

    if(!config?.tenantsURI) return;

    if(tenants.length === 0) {
        fetchJson(config.tenantsURI).then((response: Tenant[]) => {
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

export const useMenu = (type: string): UseMenuItem[] => {
    const menuInfo = menu[type] || [];
    const location = useLocation();
    const [activeId, setActiveId] = useState(() =>
        menuInfo.findIndex(item =>
            location.pathname === item?.path ||
            (item?.path && item.path !== "/" && location.pathname.startsWith(item.path))
        )
    );


    return menuInfo
        .filter(item => item.title)
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
