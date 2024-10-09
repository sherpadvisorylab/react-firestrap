import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../Theme";



export const SearchButton = () => {
    const theme = useTheme("button");
    return (
        <div className="menu-item dropdown">
            <Link
                to="/#"
                data-toggle-class="app-header-menu-search-toggled"
                data-toggle-target=".app"
                className="menu-link"
            >
                <div className="menu-icon">
                    <i className={`${theme.getIcon("search")} nav-icon`}></i>
                </div>
            </Link>
        </div>
    );
};

function Search (props) {
    return (

        <div>
            <SearchButton />
            <input className={"d-none"} type="text" placeholder="Search" onChange={props.handleSearch}/>
        </div>
    )
}

export default Search;