import { useState } from 'react';
import { useOrder } from '../../hooks/useOrder';
import { useOverviewAlerts } from '../../hooks/useOverviewAlerts';
import { useMessages } from '../../hooks/useMessages';
import { OrderPipeline } from './OrderPipeline';
import { ActionItemsCard } from './ActionItemsCard';
import { MetricsStrip } from './MetricsStrip';
import { FinancialSnapshot } from './FinancialSnapshot';
import { ActivityFeedPreview } from './ActivityFeedPreview';
import { TeamSnapshot } from './TeamSnapshot';
import { MessagesPreview } from './MessagesPreview';
import { QuickActionsBar } from './QuickActionsBar';
import { TeamMemberModal } from '../TeamMemberModal';
import { AddShotListItemsModal } from '../ShotList/AddShotListItemsModal';

export function OverviewTab() {
    const { data: orderData } = useOrder();
    const orderId = orderData?.id ?? '';

    const { alerts, isLoading: alertsLoading } = useOverviewAlerts();
    const { data: messages, isLoading: messagesLoading } = useMessages();

    const hasAlerts = alertsLoading || alerts.length > 0;
    const hasMessages = !messagesLoading && messages && messages.length > 0;

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isAddShotListOpen, setIsAddShotListOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col gap-5 max-w-screen-2xl mx-auto w-full">
                <header className="mb-1">
                    <h2 className="text-2xl font-black text-default-900 tracking-tight">
                        Order Overview
                    </h2>
                    <p className="text-sm font-medium text-default-500 mt-1">
                        At-a-glance status, alerts, and key metrics for this order.
                    </p>
                </header>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-start">
                    {/* Row 1: Pipeline + ActionItems (Alerts) */}
                    <div className={hasAlerts ? "lg:col-span-4" : "lg:col-span-6"}>
                        <OrderPipeline orderId={orderId} />
                    </div>
                    {hasAlerts && (
                        <div className="lg:col-span-2">
                            <ActionItemsCard />
                        </div>
                    )}

                    {/* Row 2: Messages + Quick Actions | Activity */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {hasMessages && <MessagesPreview />}
                        <QuickActionsBar
                            onAddTeamMember={() => setIsAddMemberOpen(true)}
                            onAddShotListItem={() => setIsAddShotListOpen(true)}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <ActivityFeedPreview orderId={orderId} />
                    </div>

                    {/* Row 3: Operational Metrics */}
                    <div className="lg:col-span-6">
                        <MetricsStrip orderId={orderId} />
                    </div>

                    {/* Row 4: Financials & Team */}
                    <div className="lg:col-span-3">
                        <FinancialSnapshot orderId={orderId} />
                    </div>
                    <div className="lg:col-span-3">
                        <TeamSnapshot />
                    </div>
                </div>
            </div>

            <TeamMemberModal
                isOpen={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
                onAddMember={() => setIsAddMemberOpen(false)}
            />
            <AddShotListItemsModal
                isOpen={isAddShotListOpen}
                onOpenChange={setIsAddShotListOpen}
            />
        </>
    );
}
