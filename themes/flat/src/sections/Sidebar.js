import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useTheme, useMenu } from "react-firestrap";

type HamburgerButtonProps = {
    target: string;
    className?: string;
};
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
    const theme = useTheme("sidebar");

    return (
        <button
            className={`navbar-toggler border-0 pc-head-link ms-0 btn ${className}`}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target={`#${target}`}
            aria-controls={target}
            aria-label="Toggle navigation"
        >
            <span className="navbar-toggler-icon">
                <i className={theme.getIcon("list")} />
            </span>
        </button>
    );
}


const Sidebar = ({id='sidebar', label = '', position = 'start', background = 'light', opacity = 75 }: SidebarProps) => {
    const theme = useTheme("sidebar");
    const menuSidebar = useMenu("sidebar");

    const isMobile = window.innerWidth < 992;
    const className = `offcanvas offcanvas-${position}`;

    const style = isMobile
        ? { width: "80%" }
        : { minWidth: '20%', overflowY: 'auto' }

    return (
        <nav className={`pc-sidebar ${className}`}
            style={style}
            tabIndex={-1}
            id={id}
            aria-label={label}>
            <div className="navbar-wrapper">
                <div className="m-header offcanvas-header">
                    <HamburgerButton target={'sidebar'} />
                    <a href="/" className="b-brand text-primary position-relative">
                        <img src="/assets/images/logo-white.svg" alt="logo" className="logo-lg" />
                    </a>
                </div>
                <div className="navbar-content offcanvas-body">
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

export const SidebarToggler = () => (
    <ul className="list-unstyled">
        <li className="pc-h-item">
            <HamburgerButton target="sidebar" />
        </li>
    </ul>
);


export default Sidebar;
