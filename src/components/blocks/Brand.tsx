import React from 'react';
import {Link} from "react-router-dom";
import {PLACEHOLDER_BRAND} from "../../Theme";
import Image from "../ui/Image";

type BrandProps = {
    url?: string;
    label?: string;
    src?: string;
    width?: number;
    height?: number;
    className?: string;
};

const Brand = ({
                   url          = undefined,
                   label        = undefined,
                   src          = undefined,
                   width        = undefined,
                   height       = 36,
                   className    = undefined
}: BrandProps) => {
    const Logo = <>
        <Image src={src || PLACEHOLDER_BRAND}
               width={width}
               height={height}
        />
        {label && <span className="brand-text">{label}</span>}
    </>

    return (<>
            {url
                ? <Link to={url} className={className}>{Logo}</Link>
                : <span className={className}>{Logo}</span>
            }
    </>);
}

export default Brand;