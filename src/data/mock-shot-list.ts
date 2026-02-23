import type { ShotListItem } from "../types/shot-list";

export const MOCK_SHOT_LIST: ShotListItem[] = [
    {
        id: 1,
        externalId: "ITM-001",
        name: "Lobster Thermidor",
        images: [],
        status: "await-uploading",
        creatorName: "John Doe",
        creatorRole: "Client",
        createdAt: "2024-02-23T10:00:00Z"
    },
    {
        id: 2,
        externalId: "ITM-002",
        name: "Salmon Nigiri Set",
        images: [
            "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&h=100&fit=crop"
        ],
        status: "await-moderation",
        creatorName: "Jane Smith",
        creatorRole: "Moderator",
        createdAt: "2024-02-23T09:30:00Z"
    },
    {
        id: 3,
        externalId: "ITM-003",
        name: "Wagyu Beef Burger",
        images: [
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop",
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop"
        ],
        status: "approved",
        creatorName: "Alice Brown",
        creatorRole: "Client",
        createdAt: "2024-02-23T09:00:00Z"
    },
    {
        id: 4,
        externalId: "ITM-004",
        name: "Truffle Pasta",
        images: [
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop"
        ],
        status: "rejected",
        creatorName: "Bob Wilson",
        creatorRole: "Moderator",
        createdAt: "2024-02-23T08:45:00Z"
    },
    {
        id: 5,
        externalId: "ITM-005",
        name: "Caesar Salad",
        images: [],
        status: "processing",
        creatorName: "Charlie Davis",
        creatorRole: "Client",
        createdAt: "2024-02-23T08:30:00Z"
    },
    {
        id: 6,
        externalId: "ITM-006",
        name: "Matcha Latte",
        images: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=100&h=100&fit=crop"
        ],
        status: "completed",
        creatorName: "David Evans",
        creatorRole: "Moderator",
        createdAt: "2024-02-23T08:00:00Z"
    },
    {
        id: 7,
        externalId: "ITM-007",
        name: "Steamed Lobster",
        images: [],
        status: "await-uploading",
        creatorName: "John Doe",
        creatorRole: "Client",
        createdAt: "2024-02-23T07:30:00Z"
    },
    {
        id: 8,
        externalId: "ITM-008",
        name: "Ribeye Steak",
        images: [
            "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=100&h=100&fit=crop"
        ],
        status: "await-moderation",
        creatorName: "Jane Smith",
        creatorRole: "Moderator",
        createdAt: "2024-02-23T07:00:00Z"
    },
    {
        id: 9,
        externalId: "ITM-009",
        name: "Wagyu Steak",
        images: [
            "https://images.unsplash.com/photo-1540331547168-8b63109225b7?w=100&h=100&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
        ],
        status: "completed",
        creatorName: "Alice Brown",
        creatorRole: "Client",
        createdAt: "2024-02-23T06:30:00Z"
    },
    {
        id: 10,
        externalId: "ITM-010",
        name: "Caprese Salad",
        images: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop"
        ],
        status: "approved",
        creatorName: "Bob Wilson",
        creatorRole: "Moderator",
        createdAt: "2024-02-23T06:00:00Z"
    }
];
