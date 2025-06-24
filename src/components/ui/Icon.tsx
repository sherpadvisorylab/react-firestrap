import React from "react";
import { UIProps, Wrapper } from "..";
import { useTheme } from "../../Theme";

interface IconProps extends UIProps {
    icon: string;
    label?: string;
    className?: string;
}

const Icon = ({ icon, label, pre, post, wrapClass, className}: IconProps) => {
    const theme = useTheme('icon');
    return <Wrapper className={wrapClass}>
        {pre}
        <i className={`${theme.getIcon(icon)}${label ? " me-1" : ""}${className || ""}`}></i>
        {label && <span>{label}</span>}
        {post}
    </Wrapper>
}

export default Icon;