export interface TeamMember {
    id: string;
    user: {
        name: string;
        avatar: string;
        email: string;
    };
    role: string;
    status: "Active" | "Paused" | "Inactive";
    addedDate: string;
    lastActivity: string;
    workerId: string;
}

export const mockTeamMembers: TeamMember[] = [
    {
        id: "1",
        user: {
            name: "Tony Reichert",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
            email: "tony.reichert@wolt.com",
        },
        role: "Sales",
        status: "Active",
        addedDate: "Jun 21st, 2024",
        lastActivity: "2 hours ago",
        workerId: "4121",
    },
    {
        id: "2",
        user: {
            name: "Zoey Lang",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=2",
            email: "zoey.lang@wolt.com",
        },
        role: "Onboarding manager",
        status: "Paused",
        addedDate: "Dec 11th, 2023",
        lastActivity: "1 day ago",
        workerId: "1123",
    },
    {
        id: "3",
        user: {
            name: "Jane Fisher",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=3",
            email: "jane.fisher@wolt.com",
        },
        role: "Senior Developer",
        status: "Inactive",
        addedDate: "Feb 20th, 2024",
        lastActivity: "2 weeks ago",
        workerId: "6542",
    },
];
