import React from 'react';
import { Gui } from 'react-firestrap';
import Default from './layouts/Default.js';
import { menu } from './conf/menu.js';

function App() {
    return (
        <Gui
            layoutDefault={Default}
            menuConfig={menu}
            importPage={(pageSource) => import(`./pages/${pageSource}.js`)}
            importTheme={() => import(`./theme.js`)}
        />
    );
}

export default App;
  