export const menu = {
    "sidebar": [
        { "title": "Dashboard", "icon": "house", "path": "/" },
        { "title": "---"},
        { "title": "Apps"},
        { "title": "Projects", "icon": "folder", "path": "/projects", children: [
                { "title": "Project1", "icon": "bar-chart", "path": "/projects/project1" },
                { "title": "Project2", "icon": "bar-chart", "path": "/projects/project2" },
                { "title": "ProjectN", "icon": "bar-chart", "path": "/projects/projectN" },
            ]},
        { "title": "Reports", "icon": "bar-chart", "path": "/reports", children: [
                { "title": "Report1", "icon": "bar-chart", "path": "/reports/report1" },
                { "title": "Report2", "icon": "bar-chart", "path": "/reports/report2" },
                { "title": "ReportN", "icon": "bar-chart", "path": "/reports/reportN" },
            ]}
    ],
    "profile": [
        { "title": "Users", "icon": "people", "path": "/users" },
        { "title": "Settings", "icon": "gear", "path": "/profile/settings" },
        { "title": "Activity Log", "icon": "list-check", "path": "/profile/activity" }
    ],
    "header": [
        { "title": "Favorites", "icon": "star-fill", "path": "/favorites" },
    ],
    "footer": [
        { "title": "Help Center", "icon": "question-circle", "path": "/help" },
        { "title": "Privacy Policy", "icon": "shield-lock", "path": "/privacy" },
        { "title": "Terms", "icon": "file-earmark-text", "path": "/terms" }
    ]
};