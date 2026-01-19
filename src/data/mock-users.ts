export interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    avatar: string;
}

export const mockUsers: User[] = [
    {
        id: "u1",
        name: "Alex Thompson",
        role: "Photographer",
        email: "alex.thompson@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=4",
    },
    {
        id: "u2",
        name: "Morgan Chen",
        role: "Designer",
        email: "morgan.chen@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=5",
    },
    {
        id: "u3",
        name: "Taylor Kim",
        role: "Developer",
        email: "taylor.kim@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=6",
    },
    {
        id: "u4",
        name: "Jamie Rodriguez",
        role: "Photographer",
        email: "jamie.rodriguez@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=7",
    },
    {
        id: "u5",
        name: "Casey Johnson",
        role: "Marketing",
        email: "casey.johnson@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=8",
    },
    {
        id: "u6",
        name: "Jordan Smith",
        role: "UX Researcher",
        email: "jordan.smith@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=9",
    },
    {
        id: "u7",
        name: "Riley Garcia",
        role: "Project Manager",
        email: "riley.garcia@example.com",
        avatar: "https://img.heroui.chat/image/avatar?w=100&h=100&u=10",
    },
];
