import React from 'react';
import { SidebarToggler } from "./Sidebar.js";
import { Brand, Menu, Notifications, SignInButton } from 'react-firestrap';

const Header = () => {
    return (
        <div id="header" className="app-header">
            <SidebarToggler device={"desktop"} toggle="collapsed" dismiss="toggled" />
            <SidebarToggler device={"mobile"} toggle="mobile-toggled" dismiss="" />
            <Brand label="[projectname]" />
            <Menu context='header' className='menu mb-0'/>
            <Notifications />
            <SignInButton
                scope={process.env.REACT_APP_GOOGLE_SCOPE}
                iconLogout={"power"}
            />
        </div>
    );
};

export default Header;
