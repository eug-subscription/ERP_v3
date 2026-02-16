import { useState, type MouseEvent, type KeyboardEvent } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance } from "../../types/pricing";
import { CurrencyDisplay } from "../pricing/CurrencyDisplay";
import { Table } from "../pricing/Table";

import { useRateItems } from "../../hooks/useRateItems";
import { TOOLTIP_DELAY } from "../../constants/ui-tokens";
import { PRICING_ITEM_TRACKING } from "../../constants/pricing";
import { getCurrencySymbol } from "../../utils/currency";
import { formatAmount, formatPercentage } from "../../utils/formatters";
import { CURRENCY_DECIMALS, PERCENTAGE_DECIMALS } from "../../constants/ui-tokens";
import { BillingLineDetail } from "./BillingLineDetail";
import { QuantityEditor } from "./QuantityEditor";
import { LineModifierEditor } from "./LineModifierEditor";

interface BillingLineRowProps {
    line: BillingLineInstance;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEditQuantity?: (line: BillingLineInstance) => void;
    onEditModifiers?: (line: BillingLineInstance) => void;
    onVoidLine?: (line: BillingLineInstance) => void;
    isUpdatingQuantity?: boolean;
    isUpdatingModifiers?: boolean;
}

export function BillingLineRow({
    line,
    isExpanded,
    onToggleExpand,
    onEditQuantity,
    onEditModifiers,
    onVoidLine,
    isUpdatingQuantity = false,
    isUpdatingModifiers = false
}: BillingLineRowProps) {
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    const { data: rateItems = [] } = useRateItems();

    const isVoided = line.status === "voided";
    const isConfirmed = line.status === "confirmed";

    const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
        if ((e.target as HTMLElement).closest('button, input, label, [role="checkbox"]')) return;
        onToggleExpand();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
        }
    };

    const getLineItemName = (id: string) => {
        const item = rateItems.find((t) => t.id === id);
        return item?.displayName || item?.name || id;
    };

    const getSourceLabel = (line: BillingLineInstance) => {
        if (line.rateSource === "manual") return "Manual Entry";
        if (line.rateSource === "rate_card") return "Rate Card";
        if (line.rateSource === "project_override") return "Project Override";
        return "Direct Addition";
    };

    return (
        <>
            {/* onClick is intentional — native <tr> does not support onPress */}
            <Table.Row
                className={isVoided ? "opacity-60 bg-default-50/30" : "cursor-pointer"}
                tabIndex={0}
                role="button"
                onClick={handleRowClick}
                onKeyDown={handleKeyDown}
                aria-expanded={isExpanded}
                aria-label={`Billing line ${line.id}, ${isExpanded ? 'expanded' : 'collapsed'} `}
            >
                {/* Expand/collapse chevron */}
                <Table.Cell className="w-12">
                    <Button
                        variant="ghost"
                        isIconOnly
                        size="sm"
                        className="rounded-lg h-8 w-8 text-default-400 group-hover/row:text-accent group-hover/row:bg-accent/10 transition-colors"
                        onPress={onToggleExpand}
                        aria-label={isExpanded ? "Collapse row" : "Expand row"}
                    >
                        <Icon
                            icon={isExpanded ? "lucide:chevron-down" : "lucide:chevron-right"}
                            className="w-4 h-4"
                        />
                    </Button>
                </Table.Cell>
                {/* Item column: merged item name + source */}
                <Table.Cell>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className={`font-bold t-compact text-foreground uppercase ${PRICING_ITEM_TRACKING} ${isVoided ? "line-through text-default-400" : ""}`}>
                                {getLineItemName(line.rateItemId)}
                            </span>
                            {isConfirmed && (
                                <Tooltip delay={TOOLTIP_DELAY}>
                                    <Tooltip.Trigger>
                                        <Icon icon="lucide:lock" className="w-3.5 h-3.5 text-success/60" />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>Confirmed and locked</Tooltip.Content>
                                </Tooltip>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-mono text-xs text-default-500">
                                {getSourceLabel(line)}
                            </span>
                        </div>
                    </div>
                </Table.Cell>
                {/* Qty column */}
                <Table.Cell>
                    {!isVoided && !isConfirmed ? (
                        <QuantityEditor
                            line={line}
                            onSave={(qty) => onEditQuantity?.({ ...line, quantityInput: qty })}
                            isPending={isUpdatingQuantity}
                        />
                    ) : (
                        <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold t-compact ${isVoided ? "line-through text-default-300" : "text-default-900"}`}>
                                    {line.quantityEffective}
                                </span>
                                <span className="t-mini text-default-400 uppercase ml-1">
                                    {line.quantityEffective === 1 ? line.appliedRulesSnapshot?.unit?.replace(/s$/, '') || "unit" : line.appliedRulesSnapshot?.unit || "units"}
                                </span>
                            </div>
                            {line.quantityInput !== line.quantityEffective && (
                                <span className="t-micro text-warning-600 font-bold bg-warning-50 pr-1.5 py-0.5 rounded opacity-70">
                                    Rule: Min {line.appliedRulesSnapshot?.minimum} applied
                                </span>
                            )}
                        </div>
                    )}
                </Table.Cell>
                {/* Rate column */}
                <Table.Cell>
                    {(() => {
                        const hasRateModifier = line.finalClientRate !== line.effectiveClientRate;
                        return (
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1">
                                    <CurrencyDisplay
                                        amount={line.finalClientRate}
                                        currency={line.currency}
                                        size="sm"
                                        color={hasRateModifier ? "success" : "default"}
                                        variant={hasRateModifier ? "soft" : "secondary"}
                                        className={`${hasRateModifier ? "font-black" : ""} ${isVoided ? "line-through" : ""}`}
                                    />
                                    <span className="t-mini text-default-400">/{line.appliedRulesSnapshot?.unit || "unit"}</span>
                                </div>
                                {hasRateModifier && !isVoided && (
                                    <span className="t-micro text-default-400 whitespace-nowrap">
                                        was {getCurrencySymbol(line.currency)}{formatAmount(line.effectiveClientRate, CURRENCY_DECIMALS)}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </Table.Cell>
                {/* Revenue column */}
                <Table.Cell align="right">
                    {(() => {
                        const hasClientModifier = line.finalClientRate !== line.effectiveClientRate;
                        const clientPercentChange = line.effectiveClientRate !== 0
                            ? ((line.finalClientRate - line.effectiveClientRate) / line.effectiveClientRate) * 100
                            : 0;
                        const preTax = line.lineClientTotalPreTax;
                        const basePreTax = line.effectiveClientRate * line.quantityEffective;

                        return (
                            <div className="flex flex-col items-end gap-0.5">
                                <CurrencyDisplay
                                    amount={preTax}
                                    currency={line.currency}
                                    size="sm"
                                    color={hasClientModifier ? "success" : "default"}
                                    variant={hasClientModifier ? "soft" : "secondary"}
                                    className={`${hasClientModifier ? "font-black" : ""} ${isVoided ? "line-through" : ""}`}
                                />
                                {hasClientModifier && !isVoided && (
                                    <span className="t-micro text-default-400 whitespace-nowrap">
                                        was {getCurrencySymbol(line.currency)}{formatAmount(basePreTax, CURRENCY_DECIMALS)}{" "}
                                        <span className={clientPercentChange > 0 ? "text-success" : "text-danger"}>
                                            ({clientPercentChange > 0 ? "+" : ""}{formatPercentage(clientPercentChange, PERCENTAGE_DECIMALS)})
                                        </span>
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </Table.Cell>
                {/* Expense column */}
                <Table.Cell align="right">
                    {(() => {
                        const hasCostModifier = line.finalCostRate !== line.effectiveCostRate;
                        const costPercentChange = line.effectiveCostRate !== 0
                            ? ((line.finalCostRate - line.effectiveCostRate) / line.effectiveCostRate) * 100
                            : 0;
                        const total = line.lineCostTotal;
                        const baseTotal = line.effectiveCostRate * line.quantityEffective;

                        return (
                            <div className="flex flex-col items-end gap-0.5">
                                <CurrencyDisplay
                                    amount={total}
                                    currency={line.currency}
                                    size="sm"
                                    color={hasCostModifier ? "warning" : "default"}
                                    variant={hasCostModifier ? "soft" : "secondary"}
                                    className={`${hasCostModifier ? "font-black" : ""} ${isVoided ? "line-through" : ""}`}
                                />
                                {hasCostModifier && !isVoided && (
                                    <span className="t-micro text-default-400 whitespace-nowrap">
                                        was {getCurrencySymbol(line.currency)}{formatAmount(baseTotal, CURRENCY_DECIMALS)}{" "}
                                        <span className={costPercentChange > 0 ? "text-danger" : "text-success"}>
                                            ({costPercentChange > 0 ? "+" : ""}{formatPercentage(costPercentChange, PERCENTAGE_DECIMALS)})
                                        </span>
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                </Table.Cell>
                {/* Actions column */}
                <Table.Cell align="right">
                    {!isVoided && !isConfirmed ? (
                        <div className="flex items-center justify-end gap-1">
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full bg-default-100/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500"
                                        onPress={() => setIsModifierModalOpen(true)}
                                        isPending={isUpdatingModifiers}
                                    >
                                        <Icon icon="lucide:pencil" className="w-4 h-4" />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Edit Details</Tooltip.Content>
                            </Tooltip>
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-full bg-default-100/50 border border-transparent hover:border-danger/20 hover:bg-danger/10 text-danger"
                                        onPress={() => onVoidLine?.(line)}
                                    >
                                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Void Line</Tooltip.Content>
                            </Tooltip>
                        </div>
                    ) : isConfirmed ? (
                        <div className="flex justify-end opacity-40">
                            <Icon icon="lucide:lock" className="w-4 h-4 text-success" />
                        </div>
                    ) : (
                        <div className="flex justify-end italic text-default-300 text-tiny font-black uppercase tracking-widest">
                            Voided
                        </div>
                    )}
                </Table.Cell>
            </Table.Row>

            {/* Detail row — intentionally raw <tr>, not Table.Row (no zebra/hover for expanded content) */}
            {isExpanded && (
                <tr className="bg-default-50/50">
                    <td colSpan={7} className="px-12 py-0 border-b border-default-100">
                        <BillingLineDetail line={line} />
                    </td>
                </tr>
            )}

            <LineModifierEditor
                key={line.id}
                line={line}
                rateItemName={getLineItemName(line.rateItemId)}
                isOpen={isModifierModalOpen}
                onOpenChange={setIsModifierModalOpen}
                onSave={(updates) => onEditModifiers?.({ ...line, ...updates })}
                isPending={isUpdatingModifiers}
            />
        </>
    );
}
