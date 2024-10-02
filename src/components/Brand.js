import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../Theme.js";
const Brand = ({txt, url, icon}) => {
    const theme = useTheme("brand");

    return (
        <div className="brand">
            <Link to={url} className="brand-logo">
                <span className="brand-img">
                    {icon && <span className="brand-img-text text-theme">
                      <i className={`${theme.getIcon(icon)}`}/>
                    </span>}
                </span>
                {txt && <span className="brand-text">{txt}</span>}
            </Link>
        </div>

    );
}

export default Brand;