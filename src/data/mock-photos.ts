export interface PhotoData {
    id: string;
    fileName: string;
    source: "API" | "Admin";
    size: string;
    createdBy: {
        name: string;
        avatar: string;
    };
    downloadedBy: {
        name: string;
        avatar: string;
    };
    status: "Available" | "In process" | "Completed";
    createdAt: string;
}

export const mockPhotos: PhotoData[] = [
    {
        id: "1",
        fileName: "Archive_1.zip",
        source: "API",
        size: "54 KB",
        createdBy: {
            name: "Gary Reichert",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
        },
        downloadedBy: {
            name: "Emma Thompson",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=6",
        },
        status: "Completed",
        createdAt: "21 Jan 2024, 12:30 AM",
    },
    {
        id: "2",
        fileName: "Archive_2.rar",
        source: "Admin",
        size: "41 KB",
        createdBy: {
            name: "Olivia Martinez",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=2",
        },
        downloadedBy: {
            name: "Marcus Lee",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=7",
        },
        status: "Available",
        createdAt: "21 Jan 2024, 12:35 AM",
    },
    {
        id: "3",
        fileName: "Product_Photo_01.zip",
        source: "API",
        size: "1.2 MB",
        createdBy: {
            name: "Gary Reichert",
            avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
        },
        downloadedBy: {
            name: "Not downloaded yet",
            avatar: "",
        },
        status: "In process",
        createdAt: "22 Jan 2024, 09:15 AM",
    },
];
