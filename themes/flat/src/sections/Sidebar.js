import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useTheme, useMenu } from "react-firestrap";


const Sidebar = () => {
    const theme = useTheme("sidebar");
    const menuSidebar = useMenu("sidebar");

    return (
        <nav className="pc-sidebar">
            <div className="navbar-wrapper">
                <div className="m-header">
                    <a href="/" className="b-brand text-primary position-relative">
                        <img src="/assets/images/logo-white.svg" alt="logo" className="logo-lg" />
                    </a>
                </div>
                <div className="navbar-content">
                    <ul className="pc-navbar">
                        {menuSidebar.map((item, index) => !item.path
                            ? <li className="pc-item pc-hasmenu" key={index}>
                                <a className="pc-link" data-bs-toggle="collapse" href={`#collapse-${index}`} role="button" aria-expanded="false" aria-controls="collapseExample">
                                    <span className="pc-micon">
                                        <i className={`${theme.getIcon(item.icon)}`} />
                                    </span>
                                    <span className="pc-mtext">{item.title}</span>
                                    <span className="pc-arrow"><i className="ph-duotone ph-caret-right"></i></span>
                                </a>
                                <ul className='pc-submenu collapse' id={`collapse-${index}`}>
                                    {item.submenu.map((subItem, i) => (
                                        <li
                                            key={`${index}-${i}`}
                                            className={
                                                "pc-item" + (subItem.active ? " active" : "")
                                            }
                                            onClick={subItem.onClick}
                                        >
                                            <Link to={subItem.path} className="pc-link">

                                                <span className="pc-mtext">{subItem.title}</span>
                                                <span className="pc-arrow"></span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                            </li>
                            : <li
                                key={index}
                                className={
                                    "pc-item" + (item.active ? " active" : "")
                                }
                                onClick={item.onClick}
                            >
                                <Link to={item.path} className="pc-link">
                                    <span className="pc-micon">
                                        <i className={`${theme.getIcon(item.icon)}`} />
                                    </span>
                                    <span className="pc-mtext">{item.title}</span>
                                    <span className="pc-arrow"></span>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export const SidebarToggler = () => {
    const theme = useTheme("sidebar");
    const [isSidebarAvailable, setIsSidebarAvailable] = useState(false);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Funzione per alternare la visibilità della sidebar
    const toggleSidebar = () => {
        const isMobile = window.innerWidth <= 1024;
        const sidebarElement = document.querySelector('.pc-sidebar');

        setIsSidebarHidden(prev => !prev);
        window.dispatchEvent(new Event('sidebar-toggle'));

        if (isMobile && sidebarElement) {
            sidebarElement.classList.toggle('mob-sidebar-active');
        }
    };


    // Controlla se sidebar esiste
    useEffect(() => {
        const sidebarElement = document.querySelector('.pc-sidebar');
        if (sidebarElement) {
            setIsSidebarAvailable(true);

            const handleSidebarToggle = () => {
                sidebarElement.classList.toggle('pc-sidebar-hide', isSidebarHidden);
            };

            window.addEventListener('sidebar-toggle', handleSidebarToggle);

            return () => {
                window.removeEventListener('sidebar-toggle', handleSidebarToggle);
            };
        }
    }, [isSidebarHidden]);

    return (<>
        {isSidebarAvailable && <ul className="list-unstyled">
            <li className="pc-h-item pc-sidebar-collapse">
                <button className="pc-head-link ms-0 btn" onClick={toggleSidebar}>
                    <i className={`${theme.getIcon("list")}`}></i>
                </button>
            </li>
            {/* Mobile */}
            <li className="pc-h-item pc-sidebar-popup">
                <button className="pc-head-link ms-0 btn" onClick={toggleSidebar}>
                    <i className={`${theme.getIcon("list")}`}></i>
                </button>
            </li>
        </ul>}
    </>);
};

export default Sidebar;
