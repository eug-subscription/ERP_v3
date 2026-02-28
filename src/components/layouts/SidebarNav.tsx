import { Link, useRouterState } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { DEFAULT_PROJECT_ID } from "../../constants/ui-tokens";
import { useTheme } from "../../hooks/useTheme";

const NAV_ITEMS = [
    { label: "Orders", path: "/uploading", icon: "lucide:file-text" },
    { label: "Team", path: "/people", icon: "lucide:users" },
    { label: "Rate Management", path: "/rates", icon: "lucide:receipt" },
    { label: "Project Settings", path: `/project/${DEFAULT_PROJECT_ID}`, icon: "lucide:settings" },
];

export function SidebarNav() {
    const router = useRouterState();
    const currentPath = router.location.pathname;
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <nav aria-label="Main navigation" className="w-56 h-screen bg-default-100 border-r border-default-200 p-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
                const isActive = currentPath.startsWith(item.path);
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-default-600 hover:bg-default-200"
                            }`}
                    >
                        <Icon icon={item.icon} className="w-5 h-5" />
                        {item.label}
                    </Link>
                );
            })}

            <div className="mt-auto pt-4 border-t border-default-200">
                <button
                    type="button"
                    onMouseDown={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-default-600 hover:bg-default-200 transition-colors w-full"
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    <Icon
                        icon={isDark ? "lucide:sun" : "lucide:moon"}
                        className="w-5 h-5 transition-transform duration-300"
                    />
                    {isDark ? "Light Mode" : "Dark Mode"}
                </button>
            </div>
        </nav>
    );
}
