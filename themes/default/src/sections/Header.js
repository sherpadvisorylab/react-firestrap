import React from 'react';
import { Notifications, SignInButton, Brand, Menu } from "react-firestrap";
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
    return (
        <nav className={`navbar navbar-expand-lg navbar-${background} text-bg-${background} bg-opacity-${opacity}`}>
            <div className="container-fluid">

                {/* Left: Hamburger + Brand */}
                <div className="d-flex align-items-center me-auto">
                    <HamburgerButton target={"sidebar"}  />
                    <Brand label="[projectname]" />
                </div>

                {/* Menu centrale allineato verso destra */}
                <Menu context='header' className='navbar-nav ms-auto' wrapClass={"collapse navbar-collapse"}/>

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
