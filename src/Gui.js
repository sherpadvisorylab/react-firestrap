import React, {useState, Suspense} from 'react';
import {
    Route,
    Routes,
    useLocation
} from 'react-router-dom';

import Authorize, {AUTH_REDIRECT_URI} from "./auth.js";
import {converter as convert} from "./libs/converter.js";
import {ThemeProvider} from "./Theme.js";
import Users from "./pages/Users.js";
import {GlobalProvider} from "./Global.js";
import integrationInit from "./integrations/init.js";
import {fetchJson} from "./libs/fetch.js";

let menu = {};
let projects = null;

function Gui({layoutDefault = null, menuConfig = {}}) {
    const layoutEmpty = ({ children }) => <>{children}</>;
    menu = menuConfig;

    function getRoute(key, item, index) {
        const pageSource = item.path === "/" ? "Home" : convert.toCamel(item.path);
        const PageComponent = item.page || React.lazy(() => import(`../pages/${pageSource}.js`).catch(() => ({ default: () => `Missing Page ../pages/${pageSource}.js` })));
        const LayoutComponent = item.layout || layoutDefault || layoutEmpty;
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
        <GlobalProvider>
            <ThemeProvider>
                <Routes>
                    <Route path={AUTH_REDIRECT_URI} element={<Authorize />}></Route>

                    {renderRoutes({ default: [{ path: "/" }], ...{
                        ...menu,
                        _auth: [{
                            path: "/users",
                            page: Users,
                            layout: layoutDefault
                        }]
                    }})}
                </Routes>
            </ThemeProvider>
        </GlobalProvider>
    );
}

export const menuProjects = async (setMenuProject, currentProject) => {
    const handleProjectClick = (project, index = null) => {
        integrationInit(project);

        if (projects && index !== null) {
            projects = projects.map((menu, i) => {
                menu.active = (i === index + 1);
                if (menu.active) {
                    localStorage.setItem("project", JSON.stringify({
                        ...project,
                        index: i
                    }));
                }

                return menu;
            });
            setMenuProject(projects);
        }
        console.log("change project", project);
    }
    const fetchProjects = async () => {
        if(!process.env.REACT_APP_PROJECTS_API) return [];

        try {
            return (await fetchJson(process.env.REACT_APP_PROJECTS_API))
                .map((project, index) => ({
                        title: project.name,
                        icon: "folder",
                        onClick: () => handleProjectClick(project, index)
                    })
                );
        } catch (error) {
            console.error('Errore nella richiesta API:', error);
            return [];
        }
    };

    const getProject = (connect = false) => {
        if(connect || currentProject) {
            integrationInit(currentProject)
        }

        return currentProject || {index: null};
    }

    if (!projects) {
        const project = getProject(true);

        projects = (await fetchProjects()).filter(menu => menu.title)
            .map((menu, index) => {
                return {
                    ...menu,
                    active: (index === project?.index)
                }
            });
        setMenuProject(projects);
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

export default Gui;
