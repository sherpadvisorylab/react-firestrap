import React from "react";
import { UIProps, Wrapper } from "..";
import { useTheme } from "../../Theme";

interface IconProps extends UIProps {
    icon: string;
    className?: string;
}

const Icon = ({ icon, pre, post, wrapClass, className}: IconProps) => {
    const theme = useTheme('icon');
    return <Wrapper className={wrapClass}>
        {pre}
        <i className={`${theme.getIcon(icon)} ${className || ""}`}></i>
        {post}
    </Wrapper>
}

export default Icon;