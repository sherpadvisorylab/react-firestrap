import React from 'react';
import { useMenu, useTheme } from "react-firestrap";
import { Link } from 'react-router-dom';

const Footer = () => {
     const theme = useTheme("sidebar");
    const menuFooter = useMenu("footer");
    return (
        <footer className="pc-footer">
            <ul className="ps-3 list-unstyled list-inline footer-link">
                {menuFooter.map((item, index) => !item.path
                    ? <li className="" key={index}>
                        {item.title === "true" ? <hr /> : <label>{item.title}</label>}
                    </li>
                    : <li
                        key={index}
                        className={
                            "list-inline-item" + (item.active ? " active" : "")
                        }
                        onClick={item.onClick}
                    >
                        <Link to={item.path} className="pc-link">
                            <span className="pc-micon">
                                <i className={`${theme.getIcon(item.icon)}`} />
                            </span>
                            <span className="pc-mtext">{item.title}</span>
                            <span className="pc-arrow"></span>
                        </Link>
                    </li>
                )}
            </ul>
        </footer>
    );
}

export default Footer;