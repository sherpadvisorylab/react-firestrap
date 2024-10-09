import React from "react";
import {useTheme} from "../Theme";

const Badge = ({children, type="info", size="", className = ""} : {
    children: any,
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark",
    className?: string
} = {}) => {
    const theme = useTheme();

    return (
        <span className={"badge bg-" + type + " " + (className || theme.Badge.className)}>
            {children}
        </span>
    )
}

export default Badge;