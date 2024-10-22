import React from "react";
import {useTheme} from "../Theme";

type BadgeProps = {
    children: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
    className?: string;
};

const Badge = ({
                   children,
                   type         = "info",
                   className    = ""
}: BadgeProps) => {
    const theme = useTheme();

    return (
        <span className={"badge bg-" + type + " " + (className || theme.Badge.className)}>
            {children}
        </span>
    )
}

export default Badge;