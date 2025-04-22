import React from 'react';

function OffCanvas () {
    return (<>
        <div className="pct-c-btn2">
            <a href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_pc_layout">
                <i className="ph-duotone ph-gear-six"></i>
            </a>
        </div>
        <div className="offcanvas border-0 pct-offcanvas offcanvas-end" tabIndex="-1" id="offcanvas_pc_layout">
            <div className="offcanvas-header justify-content-between">
                <h5 className="offcanvas-title">Settings</h5>
                <button type="button" className="btn btn-icon btn-link-danger" data-bs-dismiss="offcanvas"
                        aria-label="Close"
                ><i className="ti ti-x"></i
                ></button>
            </div>
            <div className="pct-body" style="height: calc(100% - 85px)">
                <div className="offcanvas-body py-0">
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <div className="pc-dark">
                                <h6 className="mb-1">Theme Mode</h6>
                                <p className="text-muted text-sm">Choose light or dark mode or Auto</p>
                                <div className="row theme-color theme-layout">
                                    <div className="col-4">
                                        <div className="d-grid">
                                            <button className="preset-btn btn active" data-value="true"
                                                    onClick="layout_change('light');">
                                                <span className="btn-label">Light</span>
                                                <span
                                                    className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="d-grid">
                                            <button className="preset-btn btn" data-value="false"
                                                    onClick="layout_change('dark');">
                                                <span className="btn-label">Dark</span>
                                                <span
                                                    className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="d-grid">
                                            <button
                                                className="preset-btn btn"
                                                data-value="default"
                                                onClick="layout_change_default();"
                                                data-bs-toggle="tooltip"
                                                title="Automatically sets the theme based on user's operating system's color scheme."
                                            >
                                                <span className="btn-label">Default</span>
                                                <span
                                                    className="pc-lay-icon d-flex align-items-center justify-content-center">
                      <i className="ph-duotone ph-cpu"></i>
                    </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <h6 className="mb-1">Header Theme</h6>
                            <p className="text-muted text-sm">Choose Header Theme</p>
                            <div className="row theme-color theme-header-color">
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn active" data-value="true"
                                                onClick="layout_header_change('dark');">
                                            <span className="btn-label">Dark</span>
                                            <span
                                                className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn" data-value="false"
                                                onClick="layout_header_change('light');">
                                            <span className="btn-label">Light</span>
                                            <span
                                                className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <h6 className="mb-1">Accent color</h6>
                            <p className="text-muted text-sm">Choose your primary theme color</p>
                            <div className="theme-color preset-color">
                                <a href="#!" className="active" data-value="preset-1"><i
                                    className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-2"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-3"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-4"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-5"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-6"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-7"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-8"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-9"><i className="ti ti-check"></i></a>
                                <a href="#!" data-value="preset-10"><i className="ti ti-check"></i></a>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <h6 className="mb-1">Sidebar Theme</h6>
                            <p className="text-muted text-sm">Choose Sidebar Theme</p>
                            <div className="row theme-color theme-sidebar-color">
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn" data-value="true"
                                                onClick="layout_sidebar_change('dark');">
                                            <span className="btn-label">Dark</span>
                                            <span
                                                className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn active" data-value="false"
                                                onClick="layout_sidebar_change('light');">
                                            <span className="btn-label">Light</span>
                                            <span
                                                className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <h6 className="mb-1">Sidebar Caption</h6>
                            <p className="text-muted text-sm">Sidebar Caption Hide/Show</p>
                            <div className="row theme-color theme-nav-caption">
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn active" data-value="true"
                                                onClick="layout_caption_change('true');">
                                            <span className="btn-label">Caption Show</span>
                                            <span className="pc-lay-icon"
                                            ><span></span><span></span><span><span></span><span></span></span><span></span
                                            ></span>
                                        </button>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="d-grid">
                                        <button className="preset-btn btn" data-value="false"
                                                onClick="layout_caption_change('false');">
                                            <span className="btn-label">Caption Hide</span>
                                            <span className="pc-lay-icon"
                                            ><span></span><span></span><span><span></span><span></span></span><span></span
                                            ></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="pc-rtl">
                                <h6 className="mb-1">Theme Layout</h6>
                                <p className="text-muted text-sm">LTR/RTL</p>
                                <div className="row theme-color theme-direction">
                                    <div className="col-6">
                                        <div className="d-grid">
                                            <button className="preset-btn btn active" data-value="false"
                                                    onClick="layout_rtl_change('false');">
                                                <span className="btn-label">LTR</span>
                                                <span
                                                    className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-grid">
                                            <button className="preset-btn btn" data-value="true"
                                                    onClick="layout_rtl_change('true');">
                                                <span className="btn-label">RTL</span>
                                                <span
                                                    className="pc-lay-icon"><span></span><span></span><span></span><span></span></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="pc-container-width">
                                <h6 className="mb-1">Layout Width</h6>
                                <p className="text-muted text-sm">Choose Full or Container Layout</p>
                                <div className="row theme-color theme-container">
                                    <div className="col-6">
                                        <div className="d-grid">
                                            <button className="preset-btn btn active" data-value="false"
                                                    onClick="change_box_container('false')">
                                                <span className="btn-label">Full Width</span>
                                                <span className="pc-lay-icon"
                                                ><span></span><span></span><span></span><span><span></span></span
                                                ></span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-grid">
                                            <button className="preset-btn btn" data-value="true"
                                                    onClick="change_box_container('true')">
                                                <span className="btn-label">Fixed Width</span>
                                                <span className="pc-lay-icon"
                                                ><span></span><span></span><span></span><span><span></span></span
                                                ></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="list-group-item">
                            <div className="d-grid">
                                <button className="btn btn-light-danger" id="layoutreset">Reset Layout</button>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </>);
}

export default OffCanvas;