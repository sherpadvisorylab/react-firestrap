import React, { useEffect } from 'react';
import { useTheme } from '../../Theme';
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";
import { createPortal } from 'react-dom';

type AlertProps = {
    children: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
    isFixed?: "top" | "bottom";
    timeout?: number;
    onClose?: () => void;
    icon?: string | boolean;
    className?: string;
} & UIProps;

const Alert = ({
    children,
    type = "info",
    isFixed = undefined,
    timeout = undefined,
    onClose = undefined,
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

    useEffect(() => {
        if (typeof onClose === 'function') {
            const duration = timeout || 5000;
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [onClose, timeout]);

    // @todo ristemare stile alert
    const renderAlert = () => {
        return (
            <Wrapper className={wrapClass}>
                {pre}
                <div
                    className={`d-flex align-items-center alert alert-${type} ${className || theme.Alert.className} ${isFixed && 'position-fixed w-100'}`}
                    style={isFixed ? { zIndex: 1100, [isFixed]: 50, left: "50%", transform: "translateX(-50%)" } : undefined}
                >
                    {icon && <i className={theme.getIcon(icon) + " me-1"}></i>}
                    {children}
                </div>
                {post}
            </Wrapper>
        )
    }

    return isFixed ? createPortal(renderAlert(), document.body) : renderAlert();
}

export default Alert;