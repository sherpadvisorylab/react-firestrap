import React from 'react';
import { Link } from "react-router-dom";
import { useTheme, useMenu, Notifications, SignInButton, Brand } from "react-firestrap";
import {HamburgerButton} from "./Sidebar.js";

type HeaderProps = {
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

function Header({background = 'light', opacity = 100} : HeaderProps) {
    const theme = useTheme("header");
    const menuHeader = useMenu("header");

    return (
        <nav className={`navbar navbar-expand-lg navbar-${background} text-bg-${background} bg-opacity-${opacity}`}>
            <div className="container-fluid">

                {/* Left: Hamburger + Brand */}
                <div className="d-flex align-items-center me-auto">
                    <HamburgerButton target={"sidebar"}  />
                    <Brand label="dindex" className={`navbar-brand`} />
                </div>


                {/* Menu centrale allineato verso destra */}
                {menuHeader.length && <div className="collapse navbar-collapse">
                    <ul className={`navbar-nav ms-auto`}>
                        {menuHeader.map((item, index) =>
                            item.path ? (
                                <li className="nav-item px-2" key={index}>
                                    <Link className={`nav-link${item.active ? " active" : ""}`} to={item.path}>
                                        {item.icon && <i className={`me-1 ${theme.getIcon(item.icon)}`}></i>}
                                        {item.title}
                                    </Link>
                                </li>
                            ) : null
                        )}
                    </ul>
                </div>}

                {/* Notifiche + SignIn */}
                <div className="d-flex gap-3">
                    <Notifications />
                    <SignInButton
                        scope={process.env.REACT_APP_GOOGLE_SCOPE}
                        iconLogout={"power"}
                    />
                </div>
            </div>
        </nav>
    );
}

export default Header;
