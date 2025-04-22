import React from 'react';
import {useTheme} from 'react-firestrap';

const Notifications = () => {
    const theme = useTheme("notifications");

    return <span></span>;
    return (<>
        <a
            className="pc-head-link dropdown-toggle arrow-none me-0"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
            aria-haspopup="false"
            aria-expanded="false"
        >
            <i className={`${theme.getIcon("bell")}`}></i>
            <span className="badge bg-danger pc-h-badge">3</span>
        </a>
        <div className="dropdown-menu dropdown-notification dropdown-menu-end pc-h-dropdown">
            <div className="dropdown-header d-flex align-items-center justify-content-between">
                <h4 className="m-0">Notifications</h4>
                <ul className="list-inline ms-auto mb-0">
                    <li className="list-inline-item">
                        <a href="#" className="avtar avtar-s btn-link-hover-primary">
                            <i className="ti ti-arrows-diagonal f-18"></i>
                        </a>
                    </li>
                    <li className="list-inline-item">
                        <a href="#" className="avtar avtar-s btn-link-hover-danger">
                            <i className="ti ti-x f-18"></i>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="dropdown-body text-wrap header-notification-scroll position-relative"
                 style={{maxHeight: "calc(100vh - 235px)"}}>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">
                        <p className="text-span">Today</p>
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <img src="/assets/images/user/avatar-2.jpg" alt="user-image"
                                     className="user-avtar avtar avtar-s"/>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Keefe Bond <span className="text-body"> added new tags to </span> 💪
                                            Design system</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">2 min ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                ><br/><span className="text-truncate"
                                >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                ></p
                                >
                                <span
                                    className="badge bg-light-primary border border-primary me-1 mt-1">web design</span>
                                <span
                                    className="badge bg-light-warning border border-warning me-1 mt-1">Dashobard</span>
                                <span
                                    className="badge bg-light-success border border-success me-1 mt-1">Design System</span>
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <div className="avtar avtar-s bg-light-primary">
                                    <i className={`${theme.getIcon("chats-teardrop")} f-18`}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Message</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">1 hour ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                ><br/><span className="text-truncate"
                                >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                ></p
                                >
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <p className="text-span">Yesterday</p>
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <div className="avtar avtar-s bg-light-danger">
                                    <i className={`${theme.getIcon("user")} f-18`}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Challenge invitation</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">12 hour ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                ><br/><span className="text-truncate"><strong> Jonny aber </strong> invites to join the challenge</span>
                                </p
                                >
                                <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">Decline</button>
                                <button className="btn btn-sm rounded-pill btn-primary">Accept</button>
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <div className="avtar avtar-s bg-light-info">
                                    <i className={`${theme.getIcon("notebook")} f-18`}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Forms</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">2 hour ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                    has
                                    been the industry's standard
                                    dummy text ever since the 1500s.</p
                                >
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <img src="/assets/images/user/avatar-2.jpg" alt="user-image"
                                     className="user-avtar avtar avtar-s"/>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Keefe Bond <span className="text-body"> added new tags to </span> 💪
                                            Design system</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">2 min ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                ><br/><span className="text-truncate"
                                >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                ></p
                                >
                                <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">Decline</button>
                                <button className="btn btn-sm rounded-pill btn-primary">Accept</button>
                            </div>
                        </div>
                    </li>
                    <li className="list-group-item">
                        <div className="d-flex">
                            <div className="flex-shrink-0">
                                <div className="avtar avtar-s bg-light-success">
                                    <i className={`${theme.getIcon("shield-checkered")} f-18`}></i>
                                </div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <div className="d-flex">
                                    <div className="flex-grow-1 me-3 position-relative">
                                        <h5 className="mb-0 text-truncate">Security</h5>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className="text-sm text-muted">5 hour ago</span>
                                    </div>
                                </div>
                                <p className="position-relative text-muted mt-1 mb-2"
                                >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                    has
                                    been the industry's standard
                                    dummy text ever since the 1500s.</p
                                >
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="dropdown-footer">
                <div className="row g-3">
                    <div className="col-6"
                    >
                        <div className="d-grid">
                            <button className="btn btn-primary">Archive all</button>
                        </div>
                    </div
                    >
                    <div className="col-6"
                    >
                        <div className="d-grid">
                            <button className="btn btn-outline-secondary">Mark all as read</button>
                        </div>
                    </div
                    >
                </div>
            </div>
        </div>
    </>)
}

export default Notifications;