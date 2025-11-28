import React, { useState } from 'react';
import { ActionButton, Menu } from 'react-firestrap';

const Sidebar = () => {
    const handleSidebarMobile = () => {
        const appElement = document.getElementById('app');
        appElement.classList.remove('app-sidebar-mobile-toggled');
    }

    return (
        <>
            <nav id='sidebar' className='app-sidebar app-sidebar-toggled overflow-auto'>
                <div className="app-sidebar-content">
                    <Menu context='sidebar'/>
                </div>
            </nav>

            <button className="app-sidebar-mobile-backdrop" data-toggle-target=".app" data-toggle-class="app-sidebar-mobile-toggled" onClick={handleSidebarMobile}></button>
        </>
    );
};


export const SidebarToggler = ({ device, toggle, dismiss }) => {
    let dismissClass = "";
    if (dismiss !== "") dismissClass = "app-sidebar-" + dismiss;

    const [isCollapsed, setIsCollapsed] = useState(false)

    const handleSidebar = () => {
        const isDesktop = window.innerWidth >= 768;
        const appElement = document.getElementById('app');
        const sidebar = document.getElementById('sidebar');

        if (isDesktop) {
            if (isCollapsed) {
                appElement.classList.remove('app-sidebar-collapsed');
                appElement.classList.add('app-sidebar-toggled');
                sidebar.style.marginLeft = '0px'
                setIsCollapsed(false)
            } else {
                appElement.classList.add('app-sidebar-collapsed');
                appElement.classList.remove('app-sidebar-toggled');
                sidebar.style.marginLeft = '-270px'
                setIsCollapsed(true)
            }
        } else {
            appElement.classList.add('app-sidebar-mobile-toggled');
        }
    }

    return (
        <div className={device + "-toggler"}>
            <button
                type="button"
                className="menu-toggler"
                data-toggle-class={"app-sidebar-" + toggle}
                data-dismiss-class={dismissClass}
                data-toggle-target=".app"
                onClick={handleSidebar}
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>
        </div>
    );
};
export default Sidebar;
