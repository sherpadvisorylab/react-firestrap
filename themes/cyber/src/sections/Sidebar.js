import React from 'react';
import { useMenu, useTheme } from 'react-firestrap';
import { Link } from "react-router-dom";

const Sidebar = () => {
    const theme = useTheme("sidebar")
    const menuSidebar = useMenu("sidebar");

    return (
        <nav id="sidebar" className="app-sidebar offcanvas offcanvas-start" tabindex="-1" aria-labelledby="offcanvasExampleLabel">
            <div className="offcanvas-header">
                Logo
                <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>
            <div className="app-sidebar-content offcanvas-body">
                <div className="menu">
                    {menuSidebar.map((item, index) => !item.path
                        ? <div className="menu-header" key={index}>
                            {item.title === "true" ? <hr /> : <label>{item.title}</label>}
                        </div>
                        : (
                            item.submenu ?
                                <div class="menu-item has-sub">
                                    <a class="menu-link" data-bs-toggle="collapse" href={`#collapse${index}`} role="button" aria-expanded="false" aria-controls="collapseExample">
                                        <span className="menu-icon">
                                            <i className={`${theme.getIcon(item.icon)}`} />
                                        </span>
                                        <span className="menu-text">{item.title}</span>
                                        <span class="menu-caret"><b class="caret"></b></span>
                                    </a>
                                    <div class="collapse menu-submenu" id={`collapse${index}`}>
                                        {item.submenu.map((subitem, i) => (
                                            <div class="menu-item">
                                                <a href="email_inbox.html" class="menu-link">
                                                    <span class="menu-text">{subitem.title}</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                : <div
                                    key={index}
                                    className={
                                        "menu-item" + (item.active ? " active" : "")
                                    }
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
    );
};

export const SidebarToggler = ({ device, toggle, dismiss }) => {
    let dismissClass = "";
    if (dismiss !== "") dismissClass = "app-sidebar-" + dismiss;
    return (
        <div className={device + "-toggler"}>
            <button
                type="button"
                className="menu-toggler"
                data-toggle-class={"app-sidebar-" + toggle}
                data-dismiss-class={dismissClass}
                data-toggle-target=".app"
                data-bs-toggle="offcanvas"
                data-bs-target="#sidebar"
                aria-controls="offcanvasExample"
            >
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>
        </div>
    );
};
export default Sidebar;
