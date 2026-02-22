import { Tabs, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link, useRouterState } from "@tanstack/react-router";

/**
 * ProjectTabs - Navigation tabs for project sections.
 * Uses HeroUI v3 href+render pattern for native routing integration.
 */
export function ProjectTabs() {
    const routerState = useRouterState();
    const projectId = routerState.location.pathname.split('/')[2] || '';

    const sections = [
        { id: "account", name: "Account details", icon: "lucide:layout-grid", path: `/project/${projectId}/account` },
        { id: "notifications", name: "Notifications", icon: "lucide:bell", path: `/project/${projectId}/notifications` },
        { id: "security", name: "Security", icon: "lucide:shield", path: `/project/${projectId}/security` },
        { id: "managers", name: "Managers", icon: "lucide:users", path: `/project/${projectId}/managers` },
        { id: "prices", name: "Prices", icon: "lucide:tag", path: `/project/${projectId}/prices` },
        { id: "pricingBeta", name: "Pricing Beta", icon: "lucide:coins", path: `/project/${projectId}/pricing-beta`, isBeta: true },
        { id: "workflow", name: "Workflow", icon: "lucide:git-branch", path: `/project/${projectId}/workflow` },
        { id: "guidelines", name: "Guidelines", icon: "lucide:file-text", path: `/project/${projectId}/guidelines` },
        { id: "settings", name: "Settings", icon: "lucide:settings", path: `/project/${projectId}/settings` },
    ];

    const activeTab = sections.find((s) => routerState.location.pathname === s.path)?.id || "account";

    return (
        <div className="mb-6">
            <Tabs
                selectedKey={activeTab}
            >
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Project sections">
                        {sections.map((section, index) => (
                            <Tabs.Tab
                                key={section.id}
                                id={section.id}
                                href={section.path}
                                // @ts-expect-error - HeroUI v3 render prop types don't align with TanStack Router Link props
                                render={(domProps) => <Link {...domProps} to={section.path} />}
                            >
                                {index > 0 && <Tabs.Separator />}
                                <div className="flex items-center gap-2">
                                    <Icon icon={section.icon} className="text-lg" />
                                    <span className="font-medium text-sm whitespace-nowrap">{section.name}</span>
                                    {section.isBeta && (
                                        <Chip
                                            size="sm"
                                            variant="soft"
                                            color="accent"
                                            className="h-4 px-1 t-mini font-bold"
                                        >
                                            BETA
                                        </Chip>
                                    )}
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
