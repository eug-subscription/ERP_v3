import { useQuery } from "@tanstack/react-query";
import { mockPhotos, PhotoData } from "../data/mock-photos";

async function fetchPhotos(): Promise<PhotoData[]> {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay
    return mockPhotos;
}

export function usePhotos() {
    return useQuery({
        queryKey: ["photos"],
        queryFn: fetchPhotos,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
