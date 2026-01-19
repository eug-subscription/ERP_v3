export interface UploadFile {
    id: string;
    name: string;
    size: number;
    status: "uploading" | "completed" | "failed" | "paused";
    progress: number;
    uploaded: number;
    uploadSpeed: number;
    timeRemaining: number;
    errorMessage?: string;
    fileType: string;
}

export const mockUploadFiles: UploadFile[] = [
    {
        id: "1",
        name: "DSC_0123.jpg",
        size: 3200000,
        status: "uploading",
        progress: 45,
        uploaded: 1440000,
        uploadSpeed: 250000,
        timeRemaining: 7,
        fileType: "image/jpeg",
    },
    {
        id: "2",
        name: "DSC_0124.jpg",
        size: 4500000,
        status: "completed",
        progress: 100,
        uploaded: 4500000,
        uploadSpeed: 0,
        timeRemaining: 0,
        fileType: "image/jpeg",
    },
    {
        id: "3",
        name: "DSC_0125.png",
        size: 6800000,
        status: "failed",
        progress: 23,
        uploaded: 1564000,
        uploadSpeed: 0,
        timeRemaining: 0,
        errorMessage: "Network error occurred",
        fileType: "image/png",
    },
    {
        id: "4",
        name: "PRODUCT_BANNER.jpg",
        size: 5100000,
        status: "paused",
        progress: 67,
        uploaded: 3417000,
        uploadSpeed: 0,
        timeRemaining: 0,
        fileType: "image/jpeg",
    },
    {
        id: "5",
        name: "DSC_0126.jpg",
        size: 2800000,
        status: "uploading",
        progress: 78,
        uploaded: 2184000,
        uploadSpeed: 320000,
        timeRemaining: 2,
        fileType: "image/jpeg",
    },
];
