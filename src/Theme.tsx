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
    Form: {
        wrapClass: "",
        Card: {
            headerClass: "",
            bodyClass: "",
            footerClass: ""
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