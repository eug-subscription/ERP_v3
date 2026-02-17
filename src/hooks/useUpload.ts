import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockUploadFiles, UploadFile } from "../data/mock-upload";
import { MOCK_API_DELAY } from "../constants/query-config";

async function fetchUploadFiles(): Promise<UploadFile[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockUploadFiles;
}

export function useUpload() {
    const query = useQuery({
        queryKey: ["uploadFiles"],
        queryFn: fetchUploadFiles,
    });

    const [activeTab, setActiveTab] = useState("all");

    const files = useMemo(() => query.data || [], [query.data]);

    const fileCounts = useMemo(
        () => ({
            all: files.length,
            uploading: files.filter((f) => f.status === "uploading").length,
            completed: files.filter((f) => f.status === "completed").length,
            failed: files.filter((f) => f.status === "failed").length,
            paused: files.filter((f) => f.status === "paused").length,
        }),
        [files]
    );

    const filteredFiles = useMemo(
        () => (activeTab === "all" ? files : files.filter((f) => f.status === activeTab)),
        [files, activeTab]
    );

    return {
        files,
        filteredFiles,
        fileCounts,
        activeTab,
        isLoading: query.isLoading,
        error: query.error,
        setActiveTab,
        refetch: query.refetch,
    };
}
