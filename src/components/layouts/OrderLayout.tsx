import { Outlet, useRouterState } from "@tanstack/react-router";
import { Surface, Spinner } from "@heroui/react";
import { OrderPageHeader } from "../OrderPageHeader";
import { TabNavigation } from "../TabNavigation";
import { OrderInfo } from "../OrderInfo";
import { useOrder } from "../../hooks/useOrder";

// Convert project ID slug to human-readable title case (e.g., "wolt_germany" → "Wolt Germany")
function formatProjectName(projectId: string): string {
    return projectId
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function OrderLayout() {
    const { location } = useRouterState();
    const { data: order, isLoading } = useOrder();

    // Determine if sidebar should be shown (hidden on billing tab)
    const isBillingTab = location.pathname === "/billing";
    const showSidebar = !isBillingTab;

    if (isLoading || !order) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <OrderPageHeader
                orderName={order.id}
                clientName={order.client || "Unknown Client"}
                projectName={formatProjectName(order.projectId)}
                projectId={order.projectId}
                status={order.status}
                photoCount={order.photoCount}
                profitMargin={order.profit}
            />

            <TabNavigation />

            <div className={`grid grid-cols-1 ${showSidebar ? "lg:grid-cols-[3fr_1fr]" : "lg:grid-cols-1"} gap-8 mt-1`}>
                <div>
                    <Surface variant="secondary" className="rounded-3xl shadow-sm overflow-hidden p-6 md:p-10">
                        <Outlet />
                    </Surface>
                </div>
                {showSidebar && (
                    <aside className="space-y-6">
                        <OrderInfo />
                    </aside>
                )}
            </div>
        </div>
    );
}
