export interface NewRateData {
    name: string;
    currency: string;
    amount: number;
    unit: string;
}

export interface Rate {
    id: string;
    name: string;
    unit: string;
    currency: string;
    amount: number;
    createdDate: string;
    isDefault?: boolean;
    lastUsed?: boolean;
}

export const DEFAULT_NEW_RATE: NewRateData = {
    name: "",
    currency: "USD",
    amount: 1,
    unit: "per hour",
};
export interface ServiceConfig {
    id: string;
    type: string;
    isEnabled: boolean;
    clientRateIds?: string[];
    providerRateId?: string;
    clientRateMode: "existing" | "new";
    providerRateMode: "existing" | "new";
    newClientRate?: NewRateData;
    newProviderRate?: NewRateData;
    retouchingType?: "ai" | "human";
    retoucherRateId?: string;
    retoucherRateMode?: "existing" | "new";
    newRetoucherRate?: NewRateData;
    retouchingLevel?: "standard" | "advanced" | "premium";
}

export interface ProjectStats {
    ordersThisMonth: string;
    ordersThisWeek: string;
    completedOrders: string;
    monthlyChange: string;
    weeklyChange?: string;
}

export interface ProjectInfo {
    name: string;
    createdOn: string;
    createdBy: string;
    tags: string[];
}

export const mockProjectInfo: ProjectInfo = {
    name: "Wolt Germany",
    createdOn: "Jan 10, 2023",
    createdBy: "Eugene S.",
    tags: ["Food photography", "Wolt Germany", "Wolt Food App", "Editing"],
};

export const mockRates: Rate[] = [
    {
        id: "r1",
        name: "Standard Photography",
        unit: "per hour",
        currency: "USD",
        amount: 150,
        createdDate: "2023-01-15T10:00:00Z",
        isDefault: true,
    },
    {
        id: "r2",
        name: "Premium Photography",
        unit: "per hour",
        currency: "USD",
        amount: 250,
        createdDate: "2023-03-20T14:30:00Z",
    },
    {
        id: "r3",
        name: "Standard Videography",
        unit: "per hour",
        currency: "USD",
        amount: 200,
        createdDate: "2023-05-10T09:15:00Z",
        isDefault: true,
    },
    {
        id: "r4",
        name: "Senior Editor",
        unit: "per image",
        currency: "USD",
        amount: 5,
        createdDate: "2023-08-05T16:45:00Z",
        lastUsed: true,
    },
];

export const mockProjectStats: ProjectStats = {
    ordersThisMonth: "234,420",
    ordersThisWeek: "11,210",
    completedOrders: "316",
    monthlyChange: "+13.7% vs last month",
    weeklyChange: "+15.0% vs last week",
};

export const currencies = [
    { id: "USD", symbol: "$" },
    { id: "EUR", symbol: "€" },
    { id: "GBP", symbol: "£" },
    { id: "CAD", symbol: "$" },
    { id: "AUD", symbol: "$" },
    { id: "JPY", symbol: "¥" },
    { id: "AED", symbol: "د.إ" },
];
export const rateUnits = ["per hour", "per image", "per day", "per project", "flat fee"];

export interface ServiceDefinition {
    id: string;
    label: string;
    icon: string;
    category: "photography-video" | "other";
}

export const allServices: ServiceDefinition[] = [
    // Photography & Video
    { id: "professional-photography", label: "Professional Photography", icon: "lucide:camera", category: "photography-video" },
    { id: "professional-videography", label: "Professional Videography", icon: "lucide:video", category: "photography-video" },
    { id: "simple-ai-video", label: "Simple AI-Video", icon: "lucide:film", category: "photography-video" },
    { id: "advanced-ai-video", label: "Advanced AI Video", icon: "lucide:clapperboard", category: "photography-video" },
    // Other Services
    { id: "ai-moderation-shield", label: "AI-Moderation", icon: "lucide:shield-alert", category: "other" },
    { id: "dish-recognition", label: "Dish Recognition", icon: "lucide:utensils", category: "other" },
    { id: "automated-file-naming", label: "Automated File Naming", icon: "lucide:file-text", category: "other" },
    { id: "retouching", label: "Retouching", icon: "lucide:wand-2", category: "other" },
    { id: "ai-personalise-generation", label: "AI Personalise Generation", icon: "lucide:sparkles", category: "other" },
    { id: "self-service-tool", label: "Self-Service Tool", icon: "lucide:sliders", category: "other" },
    { id: "automated-messaging", label: "Automated Messaging", icon: "lucide:message-square", category: "other" },
    { id: "menu-creation", label: "Menu Creation", icon: "lucide:list-checks", category: "other" },
    { id: "analytics-portal", label: "Analytics Portal", icon: "lucide:bar-chart-2", category: "other" },
    { id: "creative-director", label: "Creative Director", icon: "lucide:wand", category: "other" },
    { id: "storage-fee", label: "Storage Fee", icon: "lucide:database", category: "other" },
    { id: "ai-moderation-eye", label: "AI Moderation", icon: "lucide:eye", category: "other" },
];

export const defaultServiceConfigs: ServiceConfig[] = [
    {
        id: "s1",
        type: "professional-photography",
        isEnabled: true,
        clientRateIds: ["r1"],
        clientRateMode: "existing",
        providerRateMode: "existing",
    },
    {
        id: "s2",
        type: "professional-videography",
        isEnabled: false,
        clientRateIds: ["r3"],
        clientRateMode: "existing",
        providerRateMode: "existing",
    },
    {
        id: "s3",
        type: "retouching",
        isEnabled: true,
        clientRateIds: ["r4"],
        clientRateMode: "existing",
        providerRateMode: "existing",
    },
];
