import { Outlet } from "@tanstack/react-router";
import { Surface, Spinner, Button, useOverlayState } from "@heroui/react";
import { Icon } from "@iconify/react";
import { OrderPageHeader } from "../OrderPageHeader";
import { TabNavigation } from "../TabNavigation";
import { CreateOrderModal } from "../CreateOrderModal";
import { useOrder } from "../../hooks/useOrder";
import { useOrderBillingSummary } from "../../hooks/useOrderBilling";

// Convert project ID slug to human-readable title case (e.g., "wolt_germany" → "Wolt Germany")
function formatProjectName(projectId: string): string {
    return projectId
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function OrderLayout() {
    const { data: order, isLoading } = useOrder();
    const { summary } = useOrderBillingSummary(order?.id ?? '');
    const createOrderState = useOverlayState();

    const profitMargin = Math.round(summary?.marginPercentage ?? 0);

    if (isLoading || !order) {
        return (
            <div className="flex justify-center items-center h-full min-h-[50vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <OrderPageHeader
                    orderName={order.id}
                    clientName={order.client || "Unknown Client"}
                    projectName={formatProjectName(order.projectId)}
                    projectId={order.projectId}
                    status={order.status}
                    profitMargin={profitMargin}
                    createdAt={order.orderDate}
                    actions={
                        <Button
                            variant="primary"
                            size="sm"
                            onPress={createOrderState.open}
                            className="shrink-0"
                        >
                            <Icon icon="lucide:plus" className="size-4" />
                            New Order
                        </Button>
                    }
                />

                <TabNavigation />

                <Surface variant="secondary" className="rounded-3xl shadow-sm overflow-hidden p-6 md:p-10 mt-1">
                    <Outlet />
                </Surface>
            </div>

            <CreateOrderModal
                isOpen={createOrderState.isOpen}
                onOpenChange={createOrderState.setOpen}
            />
        </>
    );
}
