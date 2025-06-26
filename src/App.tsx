import React, { useState, Suspense, useMemo } from 'react';
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
import NotFound from './pages/NotFound';
import { GlobalProvider } from "./Global";
import Alert from "./components/ui/Alert";
import {
    AIConfig,
    ConfigProvider,
    DropboxConfig,
    FirebaseConfig,
    GoogleOAuth2,
    GoogleServiceAccount
} from "./Config";



interface MenuItem {
    path: string;
    title?: string;
    icon?: string;
    children?: MenuItem[];
    [key: string]: any;
}

interface UseMenuItem extends MenuItem {
    active: boolean;
    onClick?: () => void;
}

type MenuConfig = {
    [key: string]: (MenuItem & {
        page?: React.ComponentType;
        layout?: React.ComponentType;
    })[];
};

type AppProps = {
    firebaseConfig: FirebaseConfig;
    oAuth2: GoogleOAuth2;
    serviceAccount?: GoogleServiceAccount;
    dropBoxConfig?: DropboxConfig;
    aiConfig?: AIConfig;
    tenantsURI?: string;
    proxyURI?: string;
    importPage: (pagesPath: string) => Promise<{ default: React.ComponentType }>;
    importTheme?: () => Promise<{ default: { theme: object } }>;
    LayoutDefault?: React.ComponentType;
    menuConfig: MenuConfig;
};

let menu: MenuConfig = {};
export const setStaticMenu = (config: MenuConfig) => {
    menu = config;
};
export const getStaticMenu = (type: string): MenuItem[] => {
    return menu[type] || [];
};
export const getContextMenu = (): string[] => {
    return Object.keys(menu);
};

function App({
                 importPage,
                 firebaseConfig,
                 oAuth2,
                 importTheme        = undefined,
                 LayoutDefault      = undefined,
                 serviceAccount     = undefined,
                 dropBoxConfig      = undefined,
                 aiConfig           = undefined,
                 tenantsURI         = undefined,
                 proxyURI           = undefined,
                 menuConfig         = {},
}: AppProps) {
    setStaticMenu(menuConfig);

    const LayoutEmpty = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    const FallbackPage: React.FC<{ pageSource: string, message?: string }> = ({ pageSource, message }) => (
        <Alert type="warning">Missing Page: {pageSource}
            {message && <code className={"ms-2"}>{message}</code>}
        </Alert>
    );

    function getRoute(key: string, item: MenuItem, index: number): React.ReactElement {
        const component = item.component ? "/" + item.component :
            (item.path === "/" 
                ? "/Home"
                : convert.toCamel(item.path.split("*")[0])
            );
        const pageSource = `./pages${component}.js`;

        const PageComponent = item.page || React.lazy(() =>
            importPage(pageSource)
                .then((mod): { default: React.ComponentType<any> } => {
                    if (typeof mod.default !== 'function') {
                        console.warn(`⚠️ Invalid default export in ${pageSource}`);
                        return { default: () => <FallbackPage pageSource={pageSource} /> };
                    }

                    return { default: mod.default };
                })
                .catch((err: Error): { default: React.ComponentType<any> } => {
                    console.error(`❌ Failed to load ${pageSource}:`, err);
                    return { default: () => <FallbackPage pageSource={pageSource} message={err.message} /> };
                })
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
                item.children && renderRoutes({ children: item.children })
            ].filter(Boolean))
        );

    return (
        <BrowserRouter>
            <ConfigProvider defaultConfig={{
                title: "Default",
                firebase: firebaseConfig,
                google: { oAuth2, serviceAccount },
                dropbox: dropBoxConfig,
                ai: aiConfig,
                proxyURI: proxyURI
            }} tenantsURI={tenantsURI}>
                <GlobalProvider>
                    <ThemeProvider importTheme={importTheme}>
                        <Routes>
                            <Route path={AUTH_REDIRECT_URI} element={<Authorize />}></Route>
                            <Route path='*' element={<NotFound />}></Route>
                            <>
                                {renderRoutes({
                                    default: [{ path: "/" }], ...{
                                        ...menu,
                                        _auth: [{
                                            path: "/users",
                                            page: Users,
                                            layout: LayoutDefault
                                        }]
                                    }
                                })}
                            </>
                        </Routes>
                    </ThemeProvider>
                </GlobalProvider>
            </ConfigProvider>
        </BrowserRouter>
    );
}


export const useMenu = (type: string): UseMenuItem[] => {
    const menuItems: MenuItem[] = getStaticMenu(type);
    const location = useLocation();

    // Funzione ricorsiva per determinare se l'item o uno dei suoi figli è attivo
    const markActive = (items: MenuItem[]): UseMenuItem[] => {
        return items.map((item) => {
            // Determina se l'item è attivo in base alla path
            const isActive = location.pathname === item.path;

            // Se ha dei figli, applica markActive ricorsivamente
            const children = item.children ? markActive(item.children) : [];

            // Se uno dei figli è attivo, il genitore diventa attivo
            const active = isActive || children.some(child => child.active);

            return {
                ...item,
                active,
                children
            };
        });
    };

    // Ottieni il menu processato e memorizza i risultati
    return useMemo(() => markActive(menuItems), [location.pathname]);
};

export default App;
