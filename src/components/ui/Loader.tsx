import React from 'react';
import {useTheme} from "../../Theme";
import { UIProps } from '../..';
import { Wrapper } from "./GridSystem";

interface LoaderProps extends UIProps {
    show?: boolean;
    children: React.ReactNode;
    icon?: string;
    title?: string;
    description?: string;
}

function Loader({
                    children,
                    show            = false,
                    icon            = undefined,
                    title           = undefined,
                    description     = undefined,
                    pre            = undefined,
                    post           = undefined,
                    wrapClass      = undefined,
                    className      = undefined
}: LoaderProps) {
    const theme = useTheme("loader");
    icon = icon || theme.Loader.icon;
    title = title || theme.Loader.title;
    description = description || theme.Loader.description;

    return show ? (
        <Wrapper className={wrapClass || theme.Loader.wrapClass}>
            <div className={"position-relative " + (className || theme.Loader.className)} style={{minHeight: "200px"}}>
                <div className="position-absolute top-0 bottom-0 start-0 end-0"
                    style={{zIndex:10, backdropFilter: "blur(2px)", background:"rgba(255, 255, 255, 0.5)"}}>
                    {pre}
                    {(icon || title || description) && <div className="p-4 text-center position-sticky top-50">
                        {icon && <div className={icon}></div>}
                        {title && <h2 className="my-3 f-w-400">{title}</h2>}
                        {description && <p className="mb-0">{description}</p>}
                    </div>}
                    {post}
                </div>
                {children}
            </div>
        </Wrapper>
    ) : children;
}

export default Loader;