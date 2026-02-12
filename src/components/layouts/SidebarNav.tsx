import { Link, useRouterState } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { DEFAULT_PROJECT_ID } from "../../constants/ui-tokens";

const NAV_ITEMS = [
    { label: "Orders", path: "/uploading", icon: "lucide:file-text" },
    { label: "Rate Management", path: "/rates", icon: "lucide:receipt" },
    { label: "Project Settings", path: `/project/${DEFAULT_PROJECT_ID}`, icon: "lucide:settings" },
];

export function SidebarNav() {
    const router = useRouterState();
    const currentPath = router.location.pathname;

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
        </nav>
    );
}
