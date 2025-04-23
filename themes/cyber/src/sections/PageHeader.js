import React from 'react';
import {Link, useLocation} from "react-router-dom";

const PageHeader = () => {
    const location = useLocation();
    

    return (
        <div className={"page-header"}>
        <div className={"page-block"}>
            <div className={"row align-items-center justify-content-between"}>
                <div className={"col-sm-auto"}>
                    <h5 className={"pc-title"}>{/* {title} */}</h5>
                </div>
                <div className={"col-sm-auto"}>
                    
                </div>
            </div>
        </div>
    </div>
    )
}

export default PageHeader;