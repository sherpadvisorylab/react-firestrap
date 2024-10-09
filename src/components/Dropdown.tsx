import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../Theme";
import {Wrapper} from "./GridSystem";

export const Dropdown = ({
                             icon = null,
                             label = null,
                             badge = null,
                             header = null,
                             footer = null,
                             children,
                             keepDropdownOpen = false,
                             height = null,
                             wrapClass = null,
                             className = null,
                             buttonClass = null,
                             badgeClass = null,
                             menuClass = null,
                             headerClass = null,
                             footerClass = null,

}) => {
  const theme = useTheme("dropdown");
  return (
      <Wrapper className={wrapClass || theme.Dropdown.wrapClass}>
          <div className={"dropdown " + (className || theme.Dropdown.className)}>
              {(icon || label) && <button className={buttonClass || theme.Dropdown.buttonClass}
                                          type="button"
                                          data-bs-toggle="dropdown"
                                          aria-haspopup="true"
                                          aria-expanded="false"
              >
                  {icon ? <i className={theme.getIcon(icon)}></i> : ""}
                  {label}

                  {badge && <div className={badgeClass || theme.Dropdown.badgeClass}>{badge}</div>}
              </button>}
                  <div className={"dropdown-menu dropdown-menu-end " + (menuClass || theme.Dropdown.menuClass)}
                   onClick={(e) => keepDropdownOpen && e.stopPropagation()}
                   style={{height: height || "auto"}}
              >
                  {header && <h6 className={"dropdown-header " + (headerClass || theme.Dropdown.headerClass)}>{header}</h6>}
                  {children}
                  {footer &&
                    <div className={(footerClass || theme.Dropdown.footerClass)}>
                        <div className="dropdown-divider" />
                        {footer}
                    </div>
               }
              </div>
          </div>
      </Wrapper>
  );
};


export const DropdownButton = ({ url, children }) => {
    return (
        <a
            href={url || "#"}
            data-bs-toggle="dropdown"
            data-bs-display="static"
            className="menu-link"
        >
            {children}
        </a>
    );
};

export const DropdownLink = ({ url, onClick, className = "", children }) => {
    return (
        url
            ? <Link to={url || "#"}
                    className={"d-flex dropdown-item align-items-center " + (className)}
                    onClick={onClick}
            >
                {children}
            </Link>
            : <button onClick={onClick}
                      className={"d-flex dropdown-item align-items-center " + (className)}
            >
                {children}
            </button>
    );
};
