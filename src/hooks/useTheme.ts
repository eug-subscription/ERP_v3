import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "erp-theme";

function getSnapshot(): Theme {
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark";
}

function getServerSnapshot(): Theme {
    return "dark";
}

function subscribe(onStoreChange: () => void): () => void {
    function handleStorage(e: StorageEvent) {
        if (e.key === STORAGE_KEY) onStoreChange();
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.remove("light", "dark");
    root.classList.add(theme);
}

export function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    applyTheme(theme);

    const toggleTheme = useCallback(() => {
        const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    }, []);

    return { theme, toggleTheme } as const;
}
