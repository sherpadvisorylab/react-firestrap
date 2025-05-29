import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../../Theme";
import {Wrapper} from "../ui/GridSystem";
import Badge from "../ui/Badge";

interface DropdownTogglerProps {
    icon?: string;
    text?: string;
}
interface DropdownBadgeObject {
    content: number | string |React.ReactNode;
    className?: string;
    type?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
}
type DropdownBadgeProps = DropdownBadgeObject | number | string | React.ReactNode;

interface DropdownProps {
    children: React.ReactNode;
    toggleButton: string | React.ReactNode | DropdownTogglerProps;
    badge?: DropdownBadgeProps;
    header?: React.ReactNode;
    footer?: React.ReactNode;
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
    children: React.ReactNode;
    badge?: DropdownBadgeProps;
    url?: string;
    display?: "static" | "dynamic";
    className?: string;
    badgeClass?: string;
}

interface DropdownLinkProps {
    url?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    children: React.ReactNode;
}
interface DropdownHeaderProps {
    children: React.ReactNode;
    className?: string;
}
interface DropdownDividerProps {
    className?: string;
}

export const Dropdown = ({
                             children,
                             toggleButton,
                             badge              = undefined,
                             header             = undefined,
                             footer             = undefined,
                             keepDropdownOpen   = false,
                             height             = "auto",
                             wrapClass          = undefined,
                             className          = undefined,
                             buttonClass        = undefined,
                             menuClass          = undefined,
                             badgeClass         = undefined,
                             headerClass        = undefined,
                             footerClass        = undefined,

}: DropdownProps) => {
    const theme = useTheme("dropdown");
    function isDropdownToggler(button: any): button is DropdownTogglerProps {
        return (
            typeof button === "object" &&
            button !== null &&
            !React.isValidElement(button) &&
            ("icon" in button || "text" in button)
        );
    }

    const Button = <DropdownButton className={buttonClass} badge={badge} badgeClass={badgeClass}>
        {isDropdownToggler(toggleButton)
            ? <span className={theme.Dropdown.buttonClass}>
                {toggleButton.icon && <i className={theme.getIcon(toggleButton.icon)}></i>}
                {toggleButton.text}
            </span>
            : toggleButton
        }
    </DropdownButton>


    return (
        <Wrapper className={wrapClass || theme.Dropdown.wrapClass}>
            <div className={"dropdown " + (className || theme.Dropdown.className)}>
                {Button}
                <div className={"dropdown-menu dropdown-menu-end " + (menuClass || theme.Dropdown.menuClass)}
                     onClick={(e) => keepDropdownOpen && e.stopPropagation()}
                     style={{height: height}}
                >
                    {header && <div className={headerClass || theme.Dropdown.headerClass}>
                        {header}
                        <DropdownDivider />
                    </div>}
                    {children}
                    {footer && <div className={(footerClass || theme.Dropdown.footerClass)}>
                        <DropdownDivider />
                        {footer}
                    </div>}
                </div>
            </div>
        </Wrapper>
    );
};


export const DropdownButton = ({
                                   children,
                                   badge        = undefined,
                                   url          = undefined,
                                   display      = "static",
                                   className    = undefined,
                                   badgeClass   = undefined
}: DropdownButtonProps) => {
    const theme = useTheme("dropdown");

    const dropdownBadge: DropdownBadgeObject | undefined =
        badge != null
            ? typeof badge === "object" && "content" in badge
                ? badge as DropdownBadgeObject
                : { content: badge, type: "info" as const }
            : undefined;

    console.log("BADGE", dropdownBadge);

    return (
        <a
            href={url || "#"}
            data-bs-toggle="dropdown"
            data-bs-display={display}
            className={className}
        >
            {children}
            {dropdownBadge && <Badge className={badgeClass || theme.Dropdown.badgeClass} type={dropdownBadge.type}>
                {dropdownBadge.content}
            </Badge>}
        </a>
    );
};

export const DropdownItem = ({
                                 children,
                                 url        = undefined,
                                 onClick    = undefined,
                                 className  = undefined
}: DropdownLinkProps) => {
    const theme = useTheme("dropdown");
    return (
        url
            ? <Link to={url || "#"}
                    className={"dropdown-item " + (className || theme.Dropdown.menuItemClass)}
                    onClick={onClick}
            >
                {children}
            </Link>
            : <button onClick={onClick}
                      className={"dropdown-item " + (className)}
            >
                {children}
            </button>
    );
};

export const DropdownHeader = ({children, className}: DropdownHeaderProps) => {
    const theme = useTheme("dropdown");
    return (
        <div className={"dropdown-header " + (className || theme.Dropdown.menuHeaderClass)}>
            {children}
        </div>
    );
}

export const DropdownDivider = ({className}: DropdownDividerProps) => {
    const theme = useTheme("dropdown");
    return <div className={"dropdown-divider " + (className || theme.Dropdown.menuDividerClass)} />;
}
