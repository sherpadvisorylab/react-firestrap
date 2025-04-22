import React from 'react';
import Sidebar from "../sections/Sidebar.js";
import Header from "../sections/Header.js";
import PageHeader from "../sections/PageHeader.js";
import Footer from "../sections/Footer.js";
import PreLoader from "../sections/PreLoader.js";

function Default({children}) {
    return (
        <div className="app" id="app">
            <PreLoader />
            <Sidebar/>
            <Header/>
            <div className={"pc-container"}>
                <div className={"pc-content"}>
                    <PageHeader/>
                    {children}
                </div>
            </div>
            <Footer/>
        </div>
    );
}

export default Default;