import { Spinner, Breadcrumbs } from "@heroui/react";
import { useRouterState, Outlet } from "@tanstack/react-router";
import { useProjectPage } from "../../hooks/useProjectPage";
import { StatisticCard } from "./StatisticCard";

import { ProjectTabs } from "./ProjectTabs";

import { ProjectInfoCard } from "./ProjectInfoCard";
import { TagsCard } from "./TagsCard";

export function ProjectPage() {
    const { state } = useProjectPage();
    const routerState = useRouterState();
    const { stats, info, isLoading } = state;

    const isWorkflowTab = routerState.location.pathname.includes("/project/workflow");

    if (isLoading || !stats || !info) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <Breadcrumbs className="mb-3">
                    <Breadcrumbs.Item href="#">Projects</Breadcrumbs.Item>
                    <Breadcrumbs.Item isCurrent>Wolf Germany</Breadcrumbs.Item>
                </Breadcrumbs>
                <h1 className="text-3xl font-bold mb-1">Project: Wolf Germany</h1>
                <p className="text-default-500">
                    A centralized view of your projects, offering quick access to essential information.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatisticCard
                    title="Orders this month"
                    value={stats.ordersThisMonth}
                    change={stats.monthlyChange}
                />
                <StatisticCard
                    title="Orders this week"
                    value={stats.ordersThisWeek}
                    change={stats.weeklyChange}
                />
                <StatisticCard
                    title="Completed orders"
                    value={stats.completedOrders}
                />
            </div>

            <ProjectTabs />

            <div className={`grid grid-cols-1 ${isWorkflowTab ? "lg:grid-cols-1" : "lg:grid-cols-[3fr_1fr]"} gap-8 mt-8`}>
                <main>
                    <Outlet />
                </main>
                {!isWorkflowTab && (
                    <aside className="space-y-6">
                        <ProjectInfoCard info={info} />
                        <TagsCard tags={info.tags} />
                    </aside>
                )}
            </div>
        </div>
    );
}
