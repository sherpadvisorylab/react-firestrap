import React from "react";
import { Link } from "react-router-dom";
import {useMenu, useTheme} from "react-firestrap";

// Props per il pulsante hamburger
type HamburgerButtonProps = {
    target: string;
    className?: string;
};

// Props per il menu sidebar
type SidebarProps = {
    id: string;
    label?: string;
    position?: 'start' | 'end';
    opacity?: number;
    background?:
        | "primary"
        | "secondary"
        | "success"
        | "danger"
        | "warning"
        | "info"
        | "light"
        | "dark"
        | "white"
        | "transparent";
};

export function HamburgerButton({ target, className = '' }: HamburgerButtonProps) {
    return (
        <button
            className={`text-bg-dark navbar-toggler border-0 ${className}`}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target={`#${target}`}
            aria-controls={target}
            aria-label="Toggle navigation"
        >
            <span className="navbar-toggler-icon"></span>
        </button>
    );
}

function Sidebar({ id, label = '', position = 'start', background = 'light', opacity = 75 }: SidebarProps) {
    const theme = useTheme(id);
    const menu = useMenu(id);

    const isMobile = window.innerWidth < 992;
    const className = isMobile
        ? `offcanvas offcanvas-${position} text-bg-${background}`
        : `text-bg-${background} bg-opacity-${opacity} border-end p-3`
    const style = isMobile
        ? { width: "80%"}
        : { minWidth: '20%', overflowY: 'auto' }


    const renderMenu = (items: any[]) => {
        return items.map((item, index) => {
            if (!item.path && !item.children) {
                return (
                    <li className="nav-item" key={index}>
                        {item.title === "---" ? <hr /> : <label>{item.title}</label>}
                    </li>
                );
            }

            const hasChildren = item.children && item.children.length > 0;

            return (
                <li key={index} className="nav-item">
                    <Link
                        to={item.path || "#"}
                        className={`nav-link${hasChildren ? " d-flex": ""}${item.active ? " active" : ""}`}
                        onClick={item.onClick}
                        data-bs-toggle="collapse"
                        data-bs-target={`#${"collapse" + index}`}
                    >
                        {item.icon && <i className={theme.getIcon(item.icon)}></i>}
                        <span className={"flex-grow-1 ms-" + (item.icon ? "2" : "4")}>{item.title}</span>
                        {hasChildren && <i className={theme.getIcon("caret-right")}></i>}
                    </Link>

                    {/* Sotto-menu */}
                    {hasChildren && (
                        <div className="collapse" id={"collapse" + index}>
                            <ul className="nav flex-column ms-4">
                                {renderMenu(item.children)}
                            </ul>
                        </div>
                    )}
                </li>
            );
        });
    };


    return (
        <aside
            className={className}
            style={style}
            tabIndex={-1}
            id={id}
            aria-label={label}
        >
            <div className="offcanvas-header">
                {label && <h5 className="offcanvas-title" id={`${id}Label`}>
                    {label}
                </h5>}
                <HamburgerButton target={id} className={"d-lg-none btn-close"} />
            </div>

            <div className="offcanvas-body">
                {menu.length > 0 && (
                    <ul className={`navbar-nav navbar-${background} flex-column mb-auto`}>
                        {renderMenu(menu)}
                    </ul>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
