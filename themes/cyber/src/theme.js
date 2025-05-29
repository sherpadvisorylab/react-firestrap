export const theme = {
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
            wrapClass: "bootstrap-table",
            scrollClass: "",
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
        scrollClass: null,
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
        showArrow: true
    },
    Loader: {
        icon: "custom-loader",
        title: "Loading..",
        description: ""
    },
    ActionButton: {
        className: "btn-outline-theme",
        badgeClass: ""
    },
    LoadingButton: {
        className: "btn-outline-theme border-0",
        badgeClass: "",
        spinnerClass: "spinner-border spinner-border-sm"
    },
    LinkButton: {
        className: "btn-link"
    },
    Alert: {
        ClassName: ""
    },
    Badge: {
        ClassName: ""
    },
    Modal: {
        size: "lg",
        wrapClass: "",
        modalClass: "",
        headerClass: "",
        titleClass: "",
        bodyClass: "",
        footerClass: "",
        iconExpand: "arrows-out",
        iconCollapse: "arrows-in"
    },
    Dropdown: {
        wrapClass: "",
        className: "",
        buttonClass: "",
        badgeClass: "position-absolute me-1 top-0 end-0",
        menuClass: "",
        menuHeaderClass: "",
        menuItemClass: "",
        menuDividerClass: "",
        headerClass: "",
        footerClass: ""
    },
    Notifications: {
        wrapClass: "",
        Dropdown: {
            className: "",
            buttonClass: "",
            menuClass: ""
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
    },
    Menu: {
        wrapClass: "",
        className: "menu list-unstyled",
        headerClass: "menu-header",
        itemClass: "menu-item",
        linkClass: "menu-link",
        iconClass: "menu-icon me-1",
        textClass: "flex-fill",
        badgeClass: "ms-1",
        arrowClass: "",
        submenuClass: "nav flex-column ms-4",
    },
    Brand: {
        wrapClass: "",
        className: "brand",
        logoClass: "navbar-brand",
        labelClass: "navbar-text",
    },
    SignIn: {
        className: "d-flex align-items-center",
        avatarClass: "avatar rounded-circle mx-2",
    }
}