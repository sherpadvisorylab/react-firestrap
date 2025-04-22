import React from 'react';
import {Link, useLocation} from "react-router-dom";
import {Breadcrumbs, ucfirst} from "react-firestrap";

const PageHeader = () => {
    const location = useLocation();
    const title = ucfirst(location.pathname.split("/").pop());

    return (
        <div className={"page-header"}>
            <div className={"page-block"}>
                <div className={"row align-items-center justify-content-between"}>
                    <div className={"col-sm-auto"}>
                        <h5 className={"pc-title"}>{title}</h5>
                    </div>
                    <div className={"col-sm-auto"}>
                        <Breadcrumbs pre={<Link to={"/"}><i className={"ph-duotone ph-house"}></i> </Link>}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PageHeader;