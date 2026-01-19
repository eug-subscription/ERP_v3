import React from "react";
import { Separator, Skeleton } from "@heroui/react";
import { useFinancial } from "../hooks/useFinancial";

export function FinancialBreakdown() {
  const { data: financial, isLoading } = useFinancial();

  if (isLoading || !financial) {
    return (
      <section className="mb-10 scroll-mt-32">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-[2.5rem]" />
      </section>
    );
  }

  return (
    <section className="mb-10 scroll-mt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-default-900 tracking-tight">
            Financial Breakdown
          </h2>
          <p className="text-default-500 text-sm mt-1 font-medium">
            Detailed breakdown of order costs, revenue, and net profit.
          </p>
        </div>
        <div className="px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">
            Order #{financial.orderNumber}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-default-200 overflow-hidden shadow-premium">
        <div className="p-8 md:p-12">
          <div className="mb-12">
            <h3 className="text-lg font-bold text-accent mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-accent rounded-full shadow-accent-sm" />
              Costs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
              {financial.costs.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-4 border-b border-default-100/50 last:border-0 hover:translate-x-1 transition-transform group"
                >
                  <span className="text-default-500 font-medium group-hover:text-default-900 transition-colors">
                    {item.label}
                  </span>
                  <span className="font-bold text-default-900">{item.value}</span>
                </div>
              ))}
              <div className="mt-6 md:col-span-2">
                <div className="flex justify-between items-center p-6 bg-accent/5 rounded-[1.5rem] border border-accent/20 shadow-inner">
                  <span className="text-accent font-black uppercase tracking-widest text-sm">
                    Total Costs
                  </span>
                  <span className="text-accent font-black text-2xl tracking-tight">
                    {financial.costs.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-12 bg-default-100/50" />

          <div className="mb-12">
            <h3 className="text-lg font-bold text-success mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-success rounded-full shadow-success-sm" />
              Revenue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
              {financial.revenue.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-4 border-b border-default-100/50 last:border-0 hover:translate-x-1 transition-transform group"
                >
                  <span className="text-default-500 font-medium group-hover:text-default-900 transition-colors">
                    {item.label}
                  </span>
                  <span className="font-bold text-default-900">{item.value}</span>
                </div>
              ))}
              <div className="mt-6 md:col-span-2">
                <div className="flex justify-between items-center p-6 bg-success/5 rounded-[1.5rem] border border-success/20 shadow-inner">
                  <span className="text-success font-black uppercase tracking-widest text-sm">
                    Total Revenue
                  </span>
                  <span className="text-success font-black text-2xl tracking-tight">
                    {financial.revenue.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-12 bg-default-100/50" />

          <div>
            <h3 className="text-lg font-bold text-default-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-default-900 rounded-full shadow-sm" />
              Summary
            </h3>
            <div className="bg-default-900 text-white rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60 font-medium tracking-wide">Gross Profit</span>
                    <span className="text-3xl font-bold tracking-tight">
                      {financial.summary.grossProfit}
                    </span>
                  </div>
                  <Separator className="bg-white/10 mb-6" />
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2 block">
                        Net Final (incl. VAT)
                      </span>
                      <span className="text-5xl font-black text-success tracking-tighter drop-shadow-sm">
                        {financial.summary.netFinal}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-success/20 rounded-xl border border-success/30">
                      <span className="text-success font-black text-sm">
                        {financial.summary.profitMargin}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
