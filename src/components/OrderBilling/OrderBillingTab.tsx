import { Chip } from "@heroui/react";
import { useOrderBillingLines } from "../../hooks/useOrderBilling";
import { BillingLinesSection } from "./BillingLinesSection";
import { OrderBillingSummaryCard } from "./OrderBillingSummary";
import { OrderPricingCard } from "./OrderPricingCard";
import { useOrder } from "../../hooks/useOrder";

interface OrderBillingTabProps {
    orderId: string;
}

export function OrderBillingTab({ orderId }: OrderBillingTabProps) {
    const { actions } = useOrderBillingLines(orderId);

    const { data: order } = useOrder();

    return (
        <div className="space-y-8 pb-4">
            <header className="space-y-2">
                <h2 className="text-3xl font-black text-default-900 tracking-tight flex items-center gap-3">
                    Order Billing
                    <Chip size="sm" variant="soft" color="accent" className="font-black t-mini h-5 px-2">
                        Beta
                    </Chip>
                </h2>
                <p className="text-default-500 text-sm font-medium">
                    Track revenue, expenses, and margins for each line item.
                </p>
            </header>

            <div className="space-y-8">
                <div className="min-w-0">
                    <BillingLinesSection
                        orderId={orderId}
                        projectId={order?.projectId ?? "P-DEFAULT"}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OrderBillingSummaryCard
                        orderId={orderId}
                        onRetry={() => actions.refetch()}
                    />
                    <OrderPricingCard
                        projectId={order?.projectId ?? "P-DEFAULT"}
                    />
                </div>
            </div>
        </div>
    );
}
