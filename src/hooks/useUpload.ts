import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { mockUploadFiles, UploadFile } from "../data/mock-upload";
import { MOCK_API_DELAY } from "../constants/query-config";

const UPLOAD_QUERY_KEY = ["uploadFiles"];

async function fetchUploadFiles(): Promise<UploadFile[]> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY));
    return mockUploadFiles;
}

function updateFileStatus(files: UploadFile[], id: string, updater: (file: UploadFile) => UploadFile): UploadFile[] {
    return files.map((f) => (f.id === id ? updater(f) : f));
}

export function useUpload() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: UPLOAD_QUERY_KEY,
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

    const togglePause = useCallback((id: string) => {
        queryClient.setQueryData<UploadFile[]>(UPLOAD_QUERY_KEY, (old) =>
            old ? updateFileStatus(old, id, (f) => ({
                ...f,
                status: f.status === "paused" ? "uploading" : "paused",
            })) : old
        );
    }, [queryClient]);

    const retryFile = useCallback((id: string) => {
        queryClient.setQueryData<UploadFile[]>(UPLOAD_QUERY_KEY, (old) =>
            old ? updateFileStatus(old, id, (f) => ({
                ...f,
                status: "uploading",
                errorMessage: undefined,
            })) : old
        );
    }, [queryClient]);

    const cancelFile = useCallback((id: string) => {
        queryClient.setQueryData<UploadFile[]>(UPLOAD_QUERY_KEY, (old) =>
            old ? old.filter((f) => f.id !== id) : old
        );
    }, [queryClient]);

    return {
        files,
        filteredFiles,
        fileCounts,
        activeTab,
        isLoading: query.isLoading,
        error: query.error,
        setActiveTab,
        refetch: query.refetch,
        togglePause,
        retryFile,
        cancelFile,
    };
}
