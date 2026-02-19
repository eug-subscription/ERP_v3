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
    {
        id: "4",
        user: {
            name: "Alex Morgan",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=4",
            email: "alex.morgan@wolt.com",
        },
        role: "Photographer",
        status: "Active",
        addedDate: "Mar 5th, 2024",
        lastActivity: "30 minutes ago",
        workerId: "7810",
    },
    {
        id: "5",
        user: {
            name: "Sara Kim",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=5",
            email: "sara.kim@wolt.com",
        },
        role: "Photo Editor",
        status: "Active",
        addedDate: "Apr 14th, 2024",
        lastActivity: "1 hour ago",
        workerId: "3341",
    },
    {
        id: "6",
        user: {
            name: "Marcus Webb",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=6",
            email: "marcus.webb@wolt.com",
        },
        role: "Account Manager",
        status: "Paused",
        addedDate: "Jan 8th, 2024",
        lastActivity: "3 days ago",
        workerId: "9204",
    },
    {
        id: "7",
        user: {
            name: "Priya Nair",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=7",
            email: "priya.nair@wolt.com",
        },
        role: "QA Specialist",
        status: "Active",
        addedDate: "May 22nd, 2024",
        lastActivity: "Just now",
        workerId: "5577",
    },
    {
        id: "8",
        user: {
            name: "Leo Strauss",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=8",
            email: "leo.strauss@wolt.com",
        },
        role: "Retoucher",
        status: "Inactive",
        addedDate: "Nov 3rd, 2023",
        lastActivity: "1 month ago",
        workerId: "2098",
    },
];
