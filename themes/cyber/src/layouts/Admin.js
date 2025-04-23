import React from 'react';
import Sidebar from "../sections/Sidebar.js";
import Header from "../sections/Header.js";
import PreLoader from "../sections/PreLoader.js";
import PageHeader from "../sections/PageHeader.js";

function Admin({children}) {
    return (
        <div className="app" id="app">
            <PreLoader />
            <Header/>
            <Sidebar/>
            <div className={"app-content"}>
                <PageHeader />
                {children}
            </div>
        </div>
    );
}

export default Admin;