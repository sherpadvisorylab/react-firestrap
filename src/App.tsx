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
import Alert from "./components/Alert";
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
            <ConfigProvider defaultConfig={{
                title       : "Default",
                firebase    : firebaseConfig,
                google      : { oAuth2, serviceAccount },
                dropbox     : dropBoxConfig,
                ai          : aiConfig,
                proxyURI    : proxyURI
            }} tenantsURI={tenantsURI}>
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
            </ConfigProvider>
        </BrowserRouter>
    );
}



export const useMenu = (type: string): UseMenuItem[] => {
    const menuItems = getStaticMenu(type);
    const location = useLocation();
    const [activeId, setActiveId] = useState(() =>
        menuItems.findIndex(item =>
            location.pathname === item?.path ||
            (item?.path && item.path !== "/" && location.pathname.startsWith(item.path))
        )
    );


    return menuItems
        .filter(item => item.title)
        .map((item, index) => ({
            ...item,
            active: index === activeId,
            onClick: () => setActiveId(index)
        }));
}

export default App;
