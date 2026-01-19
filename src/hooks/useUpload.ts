import React from "react";
import { useQuery } from "@tanstack/react-query";
import { mockUploadFiles, UploadFile } from "../data/mock-upload";

async function fetchUploadFiles(): Promise<UploadFile[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockUploadFiles;
}

export function useUpload() {
    const query = useQuery({
        queryKey: ["uploadFiles"],
        queryFn: fetchUploadFiles,
    });

    const [activeTab, setActiveTab] = React.useState("all");

    const files = React.useMemo(() => query.data || [], [query.data]);

    const fileCounts = React.useMemo(
        () => ({
            all: files.length,
            uploading: files.filter((f) => f.status === "uploading").length,
            completed: files.filter((f) => f.status === "completed").length,
            failed: files.filter((f) => f.status === "failed").length,
            paused: files.filter((f) => f.status === "paused").length,
        }),
        [files]
    );

    const filteredFiles = React.useMemo(
        () => (activeTab === "all" ? files : files.filter((f) => f.status === activeTab)),
        [files, activeTab]
    );

    return {
        state: {
            files,
            filteredFiles,
            fileCounts,
            activeTab,
            isLoading: query.isLoading,
            error: query.error,
        },
        actions: {
            setActiveTab,
        },
    };
}
