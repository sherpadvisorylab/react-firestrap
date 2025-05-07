import React, { useState } from 'react';
import { useMenu, useTheme } from 'react-firestrap';
import { Link } from "react-router-dom";

const Sidebar = () => {
    const theme = useTheme("sidebar");
    const menuSidebar = useMenu("sidebar");

    const handleSidebarMobile = () => {
        const appElement = document.getElementById('app');
        appElement.classList.remove('app-sidebar-mobile-toggled');
    }

    return (
        <>
            <nav id='sidebar' className='app-sidebar app-sidebar-toggled'>
                <div className="app-sidebar-content">
                    <div className="menu">
                        {menuSidebar.map((item, index) =>
                            !item.path ? (
                                <div className="menu-header" key={index}>
                                    {item.title === "true" ? <hr /> : <label>{item.title}</label>}
                                </div>
                            ) : item.submenu ? (
                                <div className="menu-item has-sub" key={index}>
                                    <a
                                        className="menu-link"
                                        data-bs-toggle="collapse"
                                        href={`#collapse${index}`}
                                        role="button"
                                        aria-expanded="false"
                                        aria-controls={`collapse${index}`}
                                    >
                                        <span className="menu-icon">
                                            <i className={`${theme.getIcon(item.icon)}`} />
                                        </span>
                                        <span className="menu-text">{item.title}</span>
                                        <span className="menu-caret"><b className="caret"></b></span>
                                    </a>
                                    <div className="collapse menu-submenu" id={`collapse${index}`}>
                                        {item.submenu.map((subitem, i) => (
                                            <div className="menu-item" key={i}>
                                                <a href="email_inbox.html" className="menu-link">
                                                    <span className="menu-text">{subitem.title}</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className={"menu-item" + (item.active ? " active" : "")}
                                    onClick={item.onClick}
                                >
                                    <Link to={item.path} className="menu-link">
                                        <span className="menu-icon">
                                            <i className={`${theme.getIcon(item.icon)}`} />
                                        </span>
                                        <span className="menu-text">{item.title}</span>
                                        <span className="menu-arrow"></span>
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </nav>

            <button class="app-sidebar-mobile-backdrop" data-toggle-target=".app" data-toggle-class="app-sidebar-mobile-toggled" onClick={handleSidebarMobile}></button>
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
                appElement.classList.remove('app-sidebar-collapse');
                appElement.classList.add('app-sidebar-toggled');
                sidebar.style.marginLeft = '0px'
                setIsCollapsed(false)
            } else {
                appElement.classList.remove('app-sidebar-toggled');
                appElement.classList.add('app-sidebar-collapse');
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
