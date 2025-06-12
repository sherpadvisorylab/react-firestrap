import React from 'react';
import {useTheme} from '../../Theme';
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";

type AlertProps = {
    children: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
    icon?: string | boolean;
    className?: string;
} & UIProps;

const Alert = ({
    children,
    type         = "info",
    icon         = true,
    pre          = undefined,
    post         = undefined,
    wrapClass    = undefined,
    className    = undefined
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
    return (
        <Wrapper className={wrapClass}>
            {pre}
            <div className={"d-flex align-items-center alert alert-" + type + " " + (className || theme.Alert.className)}>
                {icon && <i className={theme.getIcon(icon) + " me-1"}></i>}
                {children}
            </div>
            {post}
        </Wrapper>
    )
}

export default Alert;