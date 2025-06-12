import React from "react";
import {useTheme} from "../../Theme";
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";

export type BadgeProps = {
    children: string | React.ReactNode;
    type?: "info" | "success" | "warning" | "danger" | "primary" | "secondary" | "light" | "dark";
} & UIProps;

const Badge = ({
    children,
    type        = "info",
    pre         = undefined,
    post        = undefined,
    wrapClass   = undefined,
    className   = undefined
}: BadgeProps) => {
    const theme = useTheme("badge");

    return (
        <Wrapper className={wrapClass}>
            {pre}
            <span className={"badge bg-" + type + " " + (className || theme.Badge.className)}>
                {children}
            </span>
            {post}
        </Wrapper>
    );
}

export default Badge;