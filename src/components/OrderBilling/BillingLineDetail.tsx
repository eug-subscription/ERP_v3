import { Icon } from "@iconify/react";
import { Card, Chip } from "@heroui/react";
import { BillingLineInstance } from "../../types/pricing";
import { CurrencyDisplay } from "../pricing/CurrencyDisplay";
import { ModifierBadge } from "../pricing/ModifierBadge";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";
import { formatPercentage } from "../../utils/formatters";
import { mockUsers } from "../../data/mock-users";

const getUserName = (userId: string) => mockUsers.find(u => u.id === userId)?.name ?? userId;

interface BillingLineDetailProps {
    line: BillingLineInstance;
}

const formatAuditDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
};

export function BillingLineDetail({ line }: BillingLineDetailProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 py-5 animate-fadeIn">
            {/* Rate Calculation Chain */}
            <div className="space-y-3">
                <h4 className="t-micro font-black uppercase tracking-widest text-default-400">
                    Pricing Details
                </h4>
                <div className="flex flex-col gap-2">
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className={PRICING_LABEL_CLASSES}>Revenue Rate</span>
                            <ModifierBadge
                                value={line.clientModifierValue}
                                type="client"
                                reasonCode={line.clientModifierReasonCode}
                                size="sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="text-default-400 t-micro mb-1">Default</span>
                                    <CurrencyDisplay amount={line.baseClientRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0" />
                                </div>
                                {line.overrideClientRate !== null && (
                                    <>
                                        <Icon icon="lucide:arrow-right" className="w-3 h-3 text-default-300 mt-4" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-default-400 t-micro mb-1">Project</span>
                                            <CurrencyDisplay amount={line.overrideClientRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0 text-warning-600" />
                                        </div>
                                    </>
                                )}
                                <Icon icon="lucide:arrow-right" className="w-3 h-3 text-default-300 mt-4" />
                                <div className="flex flex-col items-start">
                                    <span className="text-default-400 t-micro mb-1">Order</span>
                                    <CurrencyDisplay amount={line.finalClientRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-black p-0 min-w-0 text-default-900" />
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center justify-between">
                            <span className={PRICING_LABEL_CLASSES}>Expense Rate</span>
                            <ModifierBadge
                                value={line.costModifierValue}
                                type="cost"
                                reasonCode={line.costModifierReasonCode}
                                size="sm"
                            />
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="text-default-400 t-micro mb-1">Default</span>
                                    <CurrencyDisplay amount={line.baseCostRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0" />
                                </div>
                                {line.overrideCostRate !== null && (
                                    <>
                                        <Icon icon="lucide:arrow-right" className="w-3 h-3 text-default-300 mt-4" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-default-400 t-micro mb-1">Project</span>
                                            <CurrencyDisplay amount={line.overrideCostRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0 text-warning-600" />
                                        </div>
                                    </>
                                )}
                                <Icon icon="lucide:arrow-right" className="w-3 h-3 text-default-300 mt-4" />
                                <div className="flex flex-col items-start">
                                    <span className="text-default-400 t-micro mb-1">Order</span>
                                    <CurrencyDisplay amount={line.finalCostRate} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-black p-0 min-w-0 text-default-900" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-3">
                <h4 className="t-micro font-black uppercase tracking-widest text-default-400">
                    Financial Breakdown
                </h4>
                <Card className="p-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-default-500 font-medium">Margin (Pre-tax)</span>
                            <span className={`font-bold ${line.lineMargin > 0 ? "text-success" : "text-danger"}`}>
                                <CurrencyDisplay amount={line.lineMargin} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0" />
                                <span className="ml-1 text-tiny">
                                    ({formatPercentage((line.lineMargin / (line.lineClientTotalPreTax || 1)) * 100)})
                                </span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-default-500 font-medium">Tax Amount ({line.taxRate * 100}%)</span>
                            <span className="font-bold text-default-900">
                                <CurrencyDisplay amount={line.taxAmount} currency={line.currency} size="sm" variant="soft" className="bg-transparent border-none shadow-none font-bold p-0 min-w-0" />
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-default-500 font-medium">Tax Treatment</span>
                            <Chip size="sm" variant="soft" className="t-micro font-bold uppercase px-2 h-5">
                                {line.taxTreatment}
                            </Chip>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Modifier Notes */}
            <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <h4 className="t-micro font-black uppercase tracking-widest text-default-400">
                            Revenue Modifier Note
                        </h4>
                        <Card className="p-3">
                            <p className="text-xs text-default-600 italic leading-relaxed">
                                {line.clientModifierNote || "No notes provided"}
                            </p>
                        </Card>
                    </div>
                    <div className="space-y-3">
                        <h4 className="t-micro font-black uppercase tracking-widest text-default-400">
                            Audit Trail
                        </h4>
                        <Card className="p-3">
                            <div className="text-xs text-default-500 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Icon icon="lucide:plus-circle" className="size-3" />
                                    Created: {formatAuditDate(line.createdAt)} by <span className="font-bold text-default-700">{getUserName(line.createdBy)}</span>
                                </div>
                                {line.modifiedAt && (
                                    <div className="text-warning font-medium flex items-center gap-2">
                                        <Icon icon="lucide:pencil" className="size-3" />
                                        Modified: {formatAuditDate(line.modifiedAt)} by <span className="font-bold">{getUserName(line.modifiedBy ?? '')}</span>
                                    </div>
                                )}
                                {line.confirmedAt && (
                                    <div className="text-success font-medium flex items-center gap-2">
                                        <Icon icon="lucide:check-circle" className="size-3" />
                                        Confirmed: {formatAuditDate(line.confirmedAt)} by {getUserName(line.confirmedBy ?? '')}
                                    </div>
                                )}
                                {line.voidedAt && (
                                    <div>
                                        <div className="text-danger font-medium flex items-center gap-2">
                                            <Icon icon="lucide:x-circle" className="w-3 h-3 shrink-0" />
                                            Voided: {formatAuditDate(line.voidedAt)} by <span className="font-bold">{getUserName(line.voidedBy ?? '')}</span>
                                        </div>
                                        {line.voidReason && (
                                            <p className="text-xs text-default-400 italic ml-5 mt-0.5">
                                                "{line.voidReason}"
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
