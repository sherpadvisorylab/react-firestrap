import React from 'react';

import {loadScripts} from 'react-firestrap';

function Home() {
    loadScripts([
        {src: "/assets/js/plugins/apexcharts.min.js"},
        {src: "/assets/js/pages/dashboard-default.js"}
    ]);

    return (
        <div className="row">
        </div>
    );
}

export default Home;