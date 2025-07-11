import React from 'react';
import { useTheme } from '../../Theme';
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";
import { createPortal } from 'react-dom';

type AlertProps = {
    children: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
    fixedTop?: boolean;
    icon?: string | boolean;
    className?: string;
} & UIProps;

const Alert = ({
    children,
    type = "info",
    fixedTop = false,
    icon = true,
    pre = undefined,
    post = undefined,
    wrapClass = undefined,
    className = undefined
}: AlertProps) => {
    const theme = useTheme("alert");

    const ICONS = {
        info: "info",
        success: "check",
        warning: "exclamation-triangle",
        danger: "x-circle",
        primary: "",
        secondary: "",
        light: "",
        dark: ""
    };
    if (icon === true) {
        icon = ICONS[type];
    }

    console.log(fixedTop)

    // @todo ristemare stile alert
    const renderAlert = () => {
        return (
            <Wrapper className={wrapClass}>
                {pre}
                <div
                    className={`d-flex align-items-center alert alert-${type} ${className || theme.Alert.className} ${fixedTop && 'position-fixed w-50'}`}
                    style={fixedTop ? { zIndex: 1100, top: 50, left: "50%", transform: "translateX(-50%)" } : undefined}
                >
                    {icon && <i className={theme.getIcon(icon) + " me-1"}></i>}
                    {children}
                </div>
                {post}
            </Wrapper>
        )
    }

    return fixedTop === true ? createPortal(renderAlert(), document.body) : renderAlert();
}

export default Alert;