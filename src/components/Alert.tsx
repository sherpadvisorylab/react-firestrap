import React from 'react';
import {useTheme} from '../Theme';

const Alert = ({children, type="info", icon = null, className = ""} : {
    children: any,
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark",
    className?: string
} = {}) => {
    const theme = useTheme("alert");

    const ICONS = {
        info: "info",
        success: "check",
        warning: "warning",
        danger: "warning-octagon",
        primary: "",
        secondary: "",
        light: "",
        dark: ""
    };
    if (icon === null) {
        icon = ICONS[type];
    }
    return (
        <div className={"d-flex align-items-center alert alert-" + type + " " + (className || theme.Alert.className)}>
            {icon && <i className={theme.getIcon(icon) + " me-1"}></i>}
            {children}
        </div>
    )
}

export default Alert;