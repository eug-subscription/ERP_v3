import React from "react";
import { Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

/**
 * ProjectTabs component provides navigation for project-specific sections.
 * Aligned with HeroUI v3 compound component patterns and legacy design requirements.
 */
export function ProjectTabs() {
    const navigate = useNavigate();
    const routerState = useRouterState();

    const sections = [
        { id: "account", name: "Account details", icon: "lucide:layout-grid", path: "/project/account" },
        { id: "notifications", name: "Notifications", icon: "lucide:bell", path: "/project/notifications" },
        { id: "security", name: "Security", icon: "lucide:shield", path: "/project/security" },
        { id: "managers", name: "Managers", icon: "lucide:users", path: "/project/managers" },
        { id: "prices", name: "Prices", icon: "lucide:tag", path: "/project/prices" },
        { id: "workflow", name: "Workflow", icon: "lucide:git-branch", path: "/project/workflow" },
        { id: "guidelines", name: "Guidelines", icon: "lucide:file-text", path: "/project/guidelines" },
        { id: "settings", name: "Settings", icon: "lucide:settings", path: "/project/settings" },
    ];

    // Determine active tab based on current pathname
    const activeTab = sections
        .filter((s) => routerState.location.pathname.includes(s.path))
        .sort((a, b) => b.path.length - a.path.length)[0]?.id || "account";

    return (
        <div className="mb-6">
            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => {
                    const section = sections.find((s) => s.id === key);
                    if (section) {
                        navigate({ to: section.path });
                    }
                }}
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Project sections">
                        {sections.map((section) => (
                            <Tabs.Tab
                                key={section.id}
                                id={section.id}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon icon={section.icon} className="text-lg" />
                                    <span className="font-medium text-sm whitespace-nowrap">{section.name}</span>
                                </div>
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
            </Tabs>
        </div>
    );
}
