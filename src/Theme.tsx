import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';

interface Theme {
    Icons: {
        [key: string]: string;
    };
    [key: string]: any;
}

interface UseTheme extends Theme {
    getIcon: (iconName: string) => string;
}

interface ThemeProviderProps {
    children: ReactNode;
    importTheme?: () => Promise<any>;
}

const defaultTheme = {
    Icons: {
        default: 'bi bi-',
        sidebar: 'bi bi-',
        header: 'bi bi-',
        profile: 'bi bi-',
    },
    Grid: {
        Card: {
            cardClass: "",
            headerClass: "d-flex justify-content-between",
            bodyClass: "p-0",
            footerClass: "",
            showArrow: false
        },
        Table: {
            wrapClass: "",
            scrollClass: "fixed-table-container",
            tableClass: "table-striped",
            headerClass: "",
            bodyClass: "",
            footerClass: "",
            selectedClass: "table-info"
        },
        Gallery: {
            wrapClass: "",
            scrollClass: "",
            tableClass: "",
            headerClass: "",
            bodyClass: "",
            footerClass: "",
            selectedClass: "bg-primary",
            gutterSize: "1",
            rowCols: "4"
        },
        Modal: {
            size: "lg",
            wrapClass: "",
            modalClass: "",
            headerClass: "",
            titleClass: "",
            bodyClass: "",
            footerClass: "",
        }
    },
    Table: {
        wrapClass: "bootstrap-table",
        scrollClass: "fixed-table-container",
        tableClass: "table-striped",
        headerClass: "",
        bodyClass: "",
        footerClass: "",
        selectedClass: "table-info"
    },
    Gallery: {
        wrapClass: "",
        scrollClass: "",
        tableClass: "",
        headerClass: "",
        bodyClass: "",
        footerClass: "",
        selectedClass: "bg-primary",
        gutterSize: "4",
        rowCols: "2"
    },
    Carousel: {
        showIndicators: true,
        showControls: true,
        showCaption: true,
        layoutDark: false,
        autoPlay: true,
    },
    Card: {
        cardClass: "",
        headerClass: "d-flex justify-content-between bg-white bg-opacity-15 fw-400",
        bodyClass: "d-flex flex-column",
        footerClass: "",
        wrapClass: "",
        showLoader: false,
        showArrow: false
    },
    Loader: {
        icon: "custom-loader",
        title: "Loading..",
        description: ""
    },
    ActionButton: {
        className: "",
        badgeClass: "rounded-pill bg-danger",
    },
    LoadingButton: {
        className: "",
        badgeClass: "rounded-pill bg-danger",
        spinnerClass: "spinner-border spinner-border-sm"
    },
    LinkButton: {
        className: "",
    },
    Alert: {
        className: ""
    },
    Badge: {
        className: ""
    },
    Modal: {
        size: "lg",
        wrapClass: "",
        modalClass: "",
        headerClass: "",
        titleClass: "",
        bodyClass: "",
        footerClass: "",
        iconExpand: "fullscreen",
        iconCollapse: "fullscreen-exit"
    },
    Dropdown: {
        wrapClass: "",
        className: "",
        buttonClass: "btn border-0",
        badgeClass: "menu-badge bg-theme",
        menuClass: "mt-1 fs-11px w-300px pt-1",
        headerClass: "",
        footerClass: ""
    },
    Notifications: {
        wrapClass: "menu-item",
        Dropdown: {
            className: "",
            buttonClass: "menu-link btn border-0",
            menuClass: "mt-1 fs-11px w-300px pt-1"
        }
    },
    Select: {
        wrapClass: "",
        className: ""
    },
    Autocomplete: {
        wrapClass: "",
        className: ""
    },
    Form: {
        wrapClass: "",
        buttonSaveClass: "btn-outline-primary border-0",
        buttonDeleteClass: "btn-outline-danger border-0",
        buttonBackClass: "btn-link",
        Card: {
            headerClass: "",
            bodyClass: "",
            footerClass: "text-end",
        }
    }
}

const ThemeContext = createContext<Theme>(defaultTheme);

// Funzione per unire profondamente due oggetti
const deepMerge = (target: any, source: any) => {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                if (!target[key]) {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else if(source[key] !== null) {
                target[key] = source[key];
            }
        }
    }
    return target;
};

export const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjcwIiBjeT0iMzAiIHI9IjEwIiBmaWxsPSIjY2NjIiAvPgogIDxwYXRoIGQ9Ik0yMCw4MCBMNDAuNSw1MCBMNjAsODAgTDgwLDU1IEw5MCw3MCBMOTAsODAgSDEwIEwyMCw4MCBaIiBmaWxsPSIjY2NjIiAvPgo8L3N2Zz4=";
export const PLACEHOLDER_USER = "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjY2NjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZD0iTTUwIDI1Yy04LjI4IDAtMTUgNi43Mi0xNSA1cy42OCAxNSAxNSAxNSA1LTYuNzIgNS0xNS02LjcyLTE1LTE1eiIvPjxwYXRoIGQ9Ik01MCA1NEMzMy4yNyA1NCAyMCA2Ny4yNyAyMCA4NGgwYzAgMy4zMSAyLjY5IDYgNiA2aDQ4YzMuMzEgMCA2LTIuNjkgNi02aDBjMC0xNi43My0xMy4yNy0zMC00MC0zMHoiLz48L3N2Zz4=";
export const PLACEHOLDER_BRAND = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHBhdGggZD0iTTUwIDE1IEw4NSA1MCBMNTAgODUgTDE1IDUwIFoiIGZpbGw9IiNjY2MiIG9wYWNpdHk9IjAuMiIvPjxwYXRoIGQ9Ik01MCAzMCBMNzAgNTAgTDUwIDcwIEwzMCA1MCBaIiBmaWxsPSIjY2NjIi8+PC9zdmc+";


export const ThemeProvider = ({
                                                                children,
                                                                importTheme = undefined
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>();

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const module = importTheme ? await importTheme() : {};
                const optionalTheme = module.theme || {};
                const mergedTheme = deepMerge(defaultTheme, optionalTheme);
                setTheme(mergedTheme);
            } catch (err) {
                console.warn("Optional theme not found or failed to load.", err);
                setTheme(defaultTheme);
            }
        };
        loadTheme();
    }, [importTheme]);

    if (!theme) {
        //todo: aggiungere un loader
        return null;  // Fallback durante il caricamento del tema
    }

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};


export const useTheme = (iconType: string): UseTheme => {
    const theme = useContext(ThemeContext) as Theme;

    return {
        ...theme,
        getIcon(iconName : string) : string {
            return (theme.Icons[iconType] || theme.Icons.default) + iconName;
        },
    };
};