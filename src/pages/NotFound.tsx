import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../Theme";

const NotFound: React.FC = () => {
    const theme = useTheme("page");
    return (
        <div className='d-flex flex-column justify-content-center align-items-center vh-100'>
            <h1>404</h1>
            <p>Oops! Page not found.</p>
            <Link to='/'><i className={theme.getIcon("house-door")} /> Go to Home</Link>
        </div>
    );
};

export default NotFound;
