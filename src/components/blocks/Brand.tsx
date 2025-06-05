import React from 'react';
import {Link} from "react-router-dom";
import {PLACEHOLDER_BRAND, useTheme} from "../../Theme";
import Image from "../ui/Image";
import {Wrapper} from "../ui/GridSystem";

type BrandProps = {
    url?: string;
    label?: string;
    src?: string;
    width?: number;
    height?: number;
    wrapClass ?: string;
    className?: string;
    logoClass?: string;
    labelClass?: string;
};

const Brand = ({
                   url          = undefined,
                   label        = undefined,
                   src          = undefined,
                   width        = undefined,
                   height       = 36,
                   wrapClass    = undefined,
                   className    = undefined,
                   logoClass    = undefined,
                   labelClass   = undefined
}: BrandProps) => {
    const theme = useTheme("brand");
    const Logo = <>
        <Image src={src || PLACEHOLDER_BRAND}
               width={width}
               height={height}
        />
        {label && <span className={labelClass || theme.Brand.labelClass}>{label}</span>}
    </>

    return (<Wrapper className={wrapClass}>
        <div className={className || theme.Brand.className}>
            {url
                ? <Link to={url} className={logoClass || theme.Brand.logoClass}>{Logo}</Link>
                : <span className={logoClass || theme.Brand.logoClass}>{Logo}</span>
            }
        </div>
    </Wrapper>);
}

export default Brand;