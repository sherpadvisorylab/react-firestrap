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
                {menu.length && <ul className={`navbar-nav navbar-${background} flex-column mb-auto`}>
                    {menu.map((item, index) =>
                        !item.path ? (
                            <li className="nav-item" key={index}>
                                {item.title === "true" ? <hr /> : <label>{item.title}</label>}
                            </li>
                        ) : (
                            <li
                                key={index}
                                className={`nav-item`}
                                onClick={item.onClick}
                            >
                                <Link to={item.path} className={`nav-link d-flex${item.active ? " active" : ""}`}>
                                    <i className={theme.getIcon(item.icon)}></i>
                                    <span className={"flex-grow-1 ms-" + (item.icon ? "2" : "4")}>{item.title}</span>
                                    <i className={theme.getIcon("caret-right")}></i>
                                </Link>
                            </li>
                        )
                    )}
                </ul>}
            </div>
        </aside>
    );
}

export default Sidebar;
