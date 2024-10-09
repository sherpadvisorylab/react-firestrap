import React from 'react';
import {useTheme} from "../Theme";

function Loader({
                    show = false,
                    children,
                    icon = null,
                    title = null,
                    description = null
}) {
    const theme = useTheme();
    icon = icon || theme.Loader.icon;
    title = title || theme.Loader.title;
    description = description || theme.Loader.description;

    return (<>
        {show
            ? <div className={"position-relative"} style={{minHeight: "200px"}}>
                <div className="position-absolute top-0 bottom-0 start-0 end-0"
                 style={{zIndex:10, backdropFilter: "blur(2px)", background:"rgba(255, 255, 255, 0.5)"}}>
                    {(icon || title || description) && <div className="p-4 text-center position-sticky top-50">
                        {icon && <div className={icon}></div>}
                        {title && <h2 className="my-3 f-w-400">{title}</h2>}
                        {description && <p className="mb-0">{description}</p>}
                    </div>}
                </div>
                {children}
            </div>
            : children
        }
    </>)
}

export default Loader