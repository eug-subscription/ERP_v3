import { ActivityLog } from './ActivityLog/ActivityLog';
import { OrderPipeline } from './TimelinePipeline/OrderPipeline';
import { OrderPipelineLab } from './TimelinePipeline/OrderPipelineLab';

export function Timeline() {
  return (
    <section className="mb-8 scroll-mt-32">
      <header className="mb-6">
        <h2 className="text-2xl font-black text-default-900 tracking-tight">
          Timeline
        </h2>
        <p className="text-default-500 text-sm mt-1 font-medium">
          A complete history of all order activity and milestones.
        </p>
      </header>

      {/*
             * Two-column grid: Activity Log (left, grows) + Order Pipelines (right, fixed width).
             * On mobile (<lg) stacks vertically — Pipelines on top, Activity Log below.
             */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="order-2 lg:order-1">
          <ActivityLog orderId="ord-12345" />
        </div>
        <div className="order-1 lg:order-2 flex flex-col gap-6 lg:sticky lg:top-4 lg:self-start">
          <OrderPipeline orderId="ord-12345" />
          <OrderPipelineLab orderId="ord-branched-001" />
        </div>
      </div>
    </section>
  );
}
