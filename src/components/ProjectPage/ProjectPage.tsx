import { Spinner, Link } from "@heroui/react";
import { Outlet } from "@tanstack/react-router";
import { Icon } from "@iconify/react";
import { useProjectPage } from "../../hooks/useProjectPage";
import { StatisticCard } from "./StatisticCard";

import { ProjectTabs } from "./ProjectTabs";

import { ProjectInfoCard } from "./ProjectInfoCard";
import { TagsCard } from "./TagsCard";

export function ProjectPage() {
    const { state } = useProjectPage();
    const { stats, info, isLoading } = state;

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
                <nav className="flex items-center gap-2 text-sm text-default-500 mb-3" aria-label="Breadcrumb">
                    <Link href="#" className="text-default-500 hover:text-default-900 transition-colors" underline="none">
                        Projects
                    </Link>
                    <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5 opacity-50" />
                    <span className="font-medium text-default-900">Wolf Germany</span>
                </nav>
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

            <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-8 mt-8">
                <main>
                    <Outlet />
                </main>
                <aside className="space-y-6">
                    <ProjectInfoCard info={info} />
                    <TagsCard tags={info.tags} />
                </aside>
            </div>
        </div>
    );
}
