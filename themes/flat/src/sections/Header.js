import React from 'react';
import { SignInButton, useMenu, useTheme } from 'react-firestrap';

import { SidebarToggler } from "./Sidebar.js";
import Notifications from "./Notifications.js";
import { Link } from 'react-router-dom';

const Header = ({ className = "", pre = null }) => {
  const theme = useTheme("header");
  const menuHeader = useMenu("header");
  return (
    <header className={"pc-header " + className}>
      {pre}
      <div className="header-wrapper">
        <div className="me-auto pc-mob-drp">
          <SidebarToggler />
        </div>

        <div className="ms-auto">
          <ul className="list-unstyled">
            {menuHeader.map((item, index) => !item.path
              ? <li className="pc-h-item pc-caption" key={index}>
                {item.title === "true" ? <hr /> : <label>{item.title}</label>}
              </li>
              : <li
                key={index}
                className={
                  "pc-h-item" + (item.active ? " active" : "")
                }
                onClick={item.onClick}
              >
                <Link to={item.path} className="pc-head-link">
                  <span className="pc-micon">
                    <i className={`${theme.getIcon(item.icon)}`} />
                  </span>
                  <span className="pc-mtext">{item.title}</span>
                  <span className="pc-arrow"></span>
                </Link>
              </li>
            )}
            <li className="dropdown pc-h-item">
              <Notifications />
            </li>
            <li className="dropdown pc-h-item header-user-profile">
              <SignInButton scope={process.env.REACT_APP_GOOGLE_SCOPE} iconLogout={"power"} />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
