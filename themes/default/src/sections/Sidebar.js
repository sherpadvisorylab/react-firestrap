import React from "react";
import {useMenu, useTheme, Menu} from "react-firestrap";

// Props per il pulsante hamburger
type HamburgerButtonProps = {
    target: string;
    className?: string;
};

// Props per il menu sidebar
type SidebarProps = {
    id: string;
    label?: string;
    position?: 'start' | 'end';
    opacity?: number;
    background?:
        | "primary"
        | "secondary"
        | "success"
        | "danger"
        | "warning"
        | "info"
        | "light"
        | "dark"
        | "white"
        | "transparent";
};

export function HamburgerButton({ target, className = '' }: HamburgerButtonProps) {
    return (
        <button
            className={`text-bg-dark navbar-toggler border-0 ${className}`}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target={`#${target}`}
            aria-controls={target}
            aria-label="Toggle navigation"
        >
            <span className="navbar-toggler-icon"></span>
        </button>
    );
}

function Sidebar({ id, label = '', position = 'start', background = 'light', opacity = 75 }: SidebarProps) {
    const theme = useTheme(id);
    const menu = useMenu(id);

    const isMobile = window.innerWidth < 992;
    const className = isMobile
        ? `offcanvas offcanvas-${position} text-bg-${background}`
        : `text-bg-${background} bg-opacity-${opacity} border-end p-3`
    const style = isMobile
        ? { width: "80%"}
        : { minWidth: '20%', overflowY: 'auto' }

    return (
        <aside
            className={className}
            style={style}
            tabIndex={-1}
            id={id}
            aria-label={label}
        >
            <div className="offcanvas-header">
                {label && <h5 className="offcanvas-title" id={`${id}Label`}>
                    {label}
                </h5>}
                <HamburgerButton target={id} className={"d-lg-none btn-close"} />
            </div>

            <div className="offcanvas-body">
                <Menu context='sidebar' badges={{
                    layouts: {type:'warning', children: <ActionButton icon='plus' className='btn-sm p-0' onClick={() => {
                        console.log('ciao')
                    }} />},
                    pages: {type:'success', children: 'ciao'},
                    categories: {type:'danger', children: 'ciao'},
                    helper: {type:'info', children: 'ciao'},
                    contents: {type:'light', children: 'ciao'},
                    sections: {type:'dark', children: <>ciao<ActionButton icon='plus' className='btn-sm p-0' onClick={() => {
                        console.log('ciao')
                    }} /></>},
                    menus: {type:'dark', children: 'ciao'},
                }}/>
            </div>
        </aside>
    );
}

export default Sidebar;
