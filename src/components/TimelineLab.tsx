import { ActivityLog } from './ActivityLog/ActivityLog';
import { OrderPipelineLab } from './OrderPipeline/OrderPipelineLab';

/**
 * Timeline Lab — experimental copy of Timeline for pipeline iteration.
 * Uses the branched mock data (ord-branched-001) and the new OrderPipelineLab renderer.
 * Remove this component once the new pipeline is finalized and merged back.
 */
export function TimelineLab() {
    return (
        <section className="mb-8 scroll-mt-32">
            <header className="mb-6">
                <h2 className="text-2xl font-black text-default-900 tracking-tight">
                    Timeline Lab
                </h2>
                <p className="text-default-500 text-sm mt-1 font-medium">
                    Experimental pipeline — changes here do not affect the original Timeline.
                </p>
            </header>

            {/*
       * Two-column grid: Activity Log (left) + Order Pipeline Lab (right, 400px for split-column).
       * On mobile (<lg) stacks vertically — Pipeline on top, Activity Log below.
       */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
                <div className="order-2 lg:order-1">
                    <ActivityLog />
                </div>
                <div className="order-1 lg:order-2">
                    <OrderPipelineLab orderId="ord-branched-001" />
                </div>
            </div>
        </section>
    );
}
