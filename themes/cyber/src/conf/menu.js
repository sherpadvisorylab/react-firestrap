export const menu = {
    "header": [
        { "title": "Search", "icon": "search", "path": "/search" },
        { "title": "Notifications", "icon": "bell", "path": "/notifications" },
        { "title": "Profile", "icon": "person", "path": "/user" }
    ],
    "sidebar": [
        { "title": "Dashboard", "icon": "speedometer2", "path": "/" },
        { "title": "Builder" },
        { "title": "Dictionary", "icon": "collection", "path": "/dictionary" },
        { "title": "SiteTree", "icon": "diagram-3", "path": "/sitetree" },
        { "title": "SiteMap", "icon": "diagram-3", "path": "/sitemap" },
        { "title": "Work" },
        {
            "title": "Projects", "icon": "folder", "path": "/projects", "submenu": [
                { "title": "Project1", "icon": "bar-chart", "path": "/projects/project1" },
                { "title": "Project2", "icon": "bar-chart", "path": "/projects/project2" },
                { "title": "ProjectN", "icon": "bar-chart", "path": "/projects/projectN" },
            ]
        },
        {
            "title": "Reports", "icon": "bar-chart", "path": "/reports", "submenu": [
                { "title": "Report1", "icon": "bar-chart", "path": "/reports/report1" },
                { "title": "Report2", "icon": "bar-chart", "path": "/reports/report2" },
                { "title": "ReportN", "icon": "bar-chart", "path": "/reports/reportN" },
            ]
        },
        { "title": "Content" },
        { "title": "MetaObject", "icon": "braces", "path": "/metaobject" },
        { "title": "Article", "icon": "newspaper", "path": "/article" },
        { "title": "Images", "icon": "images", "path": "/images" }
    ],
    "profile": [
        { "title": "PROFILE", "icon": "person-circle", "path": "/profile" },
        { "title": "SETTINGS", "icon": "gear", "path": "/settings" },
        { "title": "PROMPTS", "icon": "gear", "path": "/prompts" }
    ],
    "pages": [
    ]
}