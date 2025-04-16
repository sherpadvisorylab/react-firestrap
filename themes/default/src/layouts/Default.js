import React from 'react';

import Header from "../sections/Header.js";
import PageHeader from "../sections/PageHeader.js";
import Footer from "../sections/Footer.js";
import PreLoader from "../sections/PreLoader.js";
import Sidebar from "../sections/Sidebar.js";

function Default({children}) {
    const background = "[background]";
    return (
        <div className="d-flex flex-column vh-100">
            <PreLoader />
            <Header background={background} />
            <div className={"d-flex flex-grow-1 overflow-hidden"}>
                <Sidebar id={"sidebar"} background={background} label={"  "}  />
                <main className={"flex-grow-1 p-3"} style={{ overflow: 'auto' }}>
                    <PageHeader/>
                    {children}
                </main>
            </div>
            <Footer/>
        </div>
    );
}

export default Default;
  