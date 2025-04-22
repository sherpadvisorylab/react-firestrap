
export const menu = {
    "sidebar": [
        {"title": "Dashboard", "icon": "house", "path": "/"},
        {
            "title": "Projects", "icon": "folder", "submenu": [
                { "title": "january", "path": "/january" },
                { "title": "february", "path": "/february" },
                { "title": "march", "path": "/march" }
            ]
        },
        { "title": "Clients", "icon": "users", "submenu": [
                { "title": "Mario Rossi", "path": "/clients/mario-rossi" },
                { "title": "Luigi Verdi", "path": "/clients/luigi-verdi" },
                { "title": "Chiara Bianchi", "path": "/chiara-bianchi" }
            ] },
        { "title": "Reports", "icon": "graph", "path": "/reports" }
    ],
    "profile": [
        { "title": "Users", "icon": "person", "path": "/users" },
        { "title": "Roles", "icon": "shield-lock", "path": "/roles" },
        { "title": "Permissions", "icon": "lock", "path": "/permissions" },
        { "title": "Settings", "icon": "sliders", "path": "/settings" },
        { "title": "---" },
        { "title": "Support", "icon": "life-preserver", "path": "/support" }
    ],
    "header": [
        { "title": " ", "icon": "chat", "path": "/messages" },
        { "title": " ", "icon": "bell", "path": "/notifications" }
    ],
    "footer": [
        { "title": "Help Center", "icon": "", "path": "/help" },
        { "title": "Privacy Policy", "icon": "", "path": "/privacy" },
        { "title": "Terms of Service", "icon": "", "path": "/terms" }
    ],
    "pages": [

    ]
}