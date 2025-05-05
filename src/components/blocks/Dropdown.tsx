import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../../Theme";
import {Wrapper} from "../ui/GridSystem";

interface DropdownProps {
    icon?: string;
    label?: string;
    badge?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    keepDropdownOpen?: boolean;
    height?: string | number;
    wrapClass?: string;
    className?: string;
    buttonClass?: string;
    badgeClass?: string;
    menuClass?: string;
    headerClass?: string;
    footerClass?: string;
}

interface DropdownButtonProps {
    url?: string;
    children: React.ReactNode;
}

interface DropdownLinkProps {
    url?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    children: React.ReactNode;
}

export const Dropdown = ({
                             children,
                             icon               = undefined,
                             label              = undefined,
                             badge              = undefined,
                             header             = undefined,
                             footer             = undefined,
                             keepDropdownOpen   = false,
                             height             = "auto",
                             wrapClass          = undefined,
                             className          = undefined,
                             buttonClass        = undefined,
                             badgeClass         = undefined,
                             menuClass          = undefined,
                             headerClass        = undefined,
                             footerClass        = undefined,

}: DropdownProps) => {
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
                   style={{height: height}}
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


export const DropdownButton = ({
                                   children,
                                   url = undefined
}: DropdownButtonProps) => {
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

export const DropdownLink = ({
                                 children,
                                 url        = undefined,
                                 onClick    = undefined,
                                 className  = undefined
}: DropdownLinkProps) => {
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
