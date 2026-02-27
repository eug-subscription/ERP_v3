import { useOrder } from '../../hooks/useOrder';
import { useOrderDetails } from '../../hooks/useOrderDetails';
import { OrderSummaryCard } from './OrderSummaryCard';
import { ContactDetailsCard } from './ContactDetailsCard';
import { SessionDetailsCard } from './SessionDetailsCard';
import { BillingContextCard } from './BillingContextCard';
import { TeamLeadCard } from './TeamLeadCard';
import { ExtraMembersCard } from './ExtraMembersCard';
import { FALLBACK_PROJECT_ID } from '../../constants/pricing';
import { TEXT_TAB_HEADING } from '../../constants/ui-tokens';

export function OrderDetailsTab() {
    const { data: orderData } = useOrder();
    const orderId = orderData?.id ?? '';

    const {
        order,
        orderTypes,
        totalSessionHours,
        scopeLines,
        taxTreatment,
        isLoading,
    } = useOrderDetails(orderId);

    return (
        <div className="flex flex-col gap-5 max-w-screen-2xl mx-auto w-full">
            <header className="mb-1">
                <h2 className={TEXT_TAB_HEADING}>
                    Order Details
                </h2>
                <p className="text-sm font-medium text-default-500 mt-1">
                    Contact, location, schedule, and billing context for this order.
                </p>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-stretch">
                {/* Row 1: Summary | Contacts */}
                <div className="lg:col-span-3 h-full">
                    <OrderSummaryCard
                        isLoading={isLoading}
                        order={order}
                    />
                </div>
                <div className="lg:col-span-3 h-full">
                    <ContactDetailsCard
                        isLoading={isLoading}
                        contact={order?.contact}
                        secondaryContact={order?.secondaryContact}
                    />
                </div>

                {/* Row 2: Session Details | Billing Context */}
                <div className="lg:col-span-3 h-full">
                    <SessionDetailsCard
                        isLoading={isLoading}
                        address={order?.address}
                        sessionTime={order?.sessionTime}
                        orderDate={order?.orderDate}
                        totalSessionHours={totalSessionHours}
                    />
                </div>
                <div className="lg:col-span-3 h-full">
                    <BillingContextCard
                        isLoading={isLoading}
                        orderTypes={orderTypes}
                        taxTreatment={taxTreatment}
                        scopeLines={scopeLines}
                        orderId={orderId}
                        projectId={order?.projectId ?? FALLBACK_PROJECT_ID}
                    />
                </div>

                {/* Row 3: Team Lead | Extra Members */}
                <div className="lg:col-span-3 h-full">
                    <TeamLeadCard
                        isLoading={isLoading}
                        assignedLead={order?.assignedLead}
                    />
                </div>
                <div className="lg:col-span-3 h-full">
                    <ExtraMembersCard
                        isLoading={isLoading}
                        extraMembers={order?.extraMembers ?? []}
                        assignedLead={order?.assignedLead}
                    />
                </div>
            </div>
        </div>
    );
}
