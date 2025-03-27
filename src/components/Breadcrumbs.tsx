import React from 'react';
import {Link, useLocation} from "react-router-dom";
import {trimSlash} from "../libs/utils";

type Breadcrumb = {
    label: string;
    url: string;
};

type BreadcrumbsProps = {
    path?: string;
    pre?: React.ReactNode;
    className?: string;
};

export const Breadcrumbs = ({
                                path        = undefined,
                                pre         = undefined,
                                className   = undefined
}: BreadcrumbsProps) => {
    const location = useLocation();
    const pathname = trimSlash(path || location.pathname);

    const tokens = pathname.split('/');
    const current = tokens.pop();

    let breadcrumbs: Breadcrumb[] = [];
    let tokenPath = '';
    for(const token of tokens) {
        tokenPath += `/${token}`;
        breadcrumbs.push({
            label: token,
            url: tokenPath
        });
    }

    return (breadcrumbs.length || pre) && pathname ? (
        <ol className={`breadcrumb ${className}`}>
            {pre && <li className="breadcrumb-item">{pre}</li>}
            {breadcrumbs.map((breadcrumb, index) => (
            <li className="breadcrumb-item" key={index}>
                <Link to={breadcrumb.url}>{breadcrumb.label}</Link>
            </li>
            ))}
            <li className="breadcrumb-item active">{current}</li>
        </ol>
    ) : <>{current}</>;
}

export default Breadcrumbs;
