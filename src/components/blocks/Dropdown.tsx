import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../../Theme";
import {Wrapper} from "../ui/GridSystem";
import Badge from "../ui/Badge";
import Menu from './Menu';

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
    position?: "start" | "end";
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
    display?: "static" | "dynamic";
    className?: string;
    badgeClass?: string;
}

interface DropdownItemProps {
    url?: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
    className?: string;
    children: React.ReactNode;
    icon?: string;
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
            ? <>
                {toggleButton.icon && <i className={theme.getIcon(toggleButton.icon)}></i>}
                {toggleButton.text}
            </>
            : toggleButton
        }
    </DropdownButton>


    return (
        <Wrapper className={wrapClass || theme.Dropdown.wrapClass}>
            <div className={"dropdown " + (className || theme.Dropdown.className)}>
                {Button}
                <div className={"dropdown-menu dropdown-menu-end " + (menuClass || theme.Dropdown.menuClass)}
                     onClick={(e) => keepDropdownOpen && e.stopPropagation()}
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

    return (
        <div
            data-bs-toggle="dropdown"
            data-bs-display={display}
            className={className || theme.Dropdown.buttonClass}
            style={{cursor: "pointer"}}
        >
            {children}
            {dropdownBadge && <Badge className={badgeClass || theme.Dropdown.badgeClass} type={dropdownBadge.type}>
                {dropdownBadge.content}
            </Badge>}
        </div>
    );
};

export const DropdownItem = ({
                                 children,
                                 url        = undefined,
                                 onClick    = undefined,
                                 icon       = undefined,
                                 className  = undefined
}: DropdownItemProps) => {
    const theme = useTheme("dropdown");
    const item = icon 
        ? <>
            <span className={"me-1"}>
                <i className={theme.getIcon(icon)}></i>
            </span>
            <span className={"flex-column"}>
                {children}
            </span>
        </> 
        : children;

    return (
        url
            ? <Link to={url || "#"}
                    className={"dropdown-item " + (className || theme.Dropdown.menuItemClass)}
                    onClick={onClick}
            >
                {item}
            </Link>
            : <button onClick={onClick}
                      className={"dropdown-item " + (className || theme.Dropdown.menuItemClass)}
            >
                {item}
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

interface DropdownMenuProps {
    context: string;
    Type?: 'ul' | 'ol';
    badges?: Record<string, any>;
    pre?: React.ReactNode;
    post?: React.ReactNode;
}

export const DropdownMenu = ({  
    context,
    Type          = 'ul',
    badges        = {},
    pre           = undefined,
    post          = undefined
}: DropdownMenuProps) => {
    const theme = useTheme("dropdown");

    return <Menu 
        context={context} 
        Type={Type} 
        badges={badges} 
        pre={pre} 
        post={post} 
        wrapClass={theme.Dropdown.Menu.wrapClass}
        className={theme.Dropdown.Menu.className}
        headerClass={theme.Dropdown.Menu.headerClass}
        itemClass={theme.Dropdown.Menu.itemClass}
        linkClass={theme.Dropdown.Menu.linkClass}
        iconClass={theme.Dropdown.Menu.iconClass}
        textClass={theme.Dropdown.Menu.textClass}
        badgeClass={theme.Dropdown.Menu.badgeClass}
        arrowClass={theme.Dropdown.Menu.arrowClass}
        submenuClass={theme.Dropdown.Menu.submenuClass}
    />
}