import React from 'react';
import { SidebarToggler } from "./Sidebar.js";
import { useMenu, useTheme } from 'react-firestrap';
import { Link } from 'react-router-dom';

const Header = () => {
  const theme = useTheme("sidebar")
  const menuHeader = useMenu("header")

  return (
    <div id="header" className="app-header">
      <SidebarToggler device={"desktop"} toggle="collapsed" dismiss="toggled" />
      <SidebarToggler device={"mobile"} toggle="mobile-toggled" dismiss="" />
      <div className="menu">
        {
          menuHeader.map((item, index) => (
            <div className="menu-item dropdown dropdown-mobile-full">
              <Link to={item.path} className="menu-link">
                <span className="menu-icon">
                  <i className={`${theme.getIcon(item.icon)}`} />
                </span>
              </Link>
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default Header;
