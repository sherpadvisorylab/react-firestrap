import React from 'react';
import {Link} from "react-router-dom";
import {useTheme} from "../../Theme";


interface SearchProps {
    handleSearch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
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

function Search ({
                     handleSearch = undefined
}: SearchProps) {
    return (

        <div>
            <SearchButton />
            <input className={"d-none"} type="text" placeholder="Search" onChange={handleSearch}/>
        </div>
    )
}

export default Search;