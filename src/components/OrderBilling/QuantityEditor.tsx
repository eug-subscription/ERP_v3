import React, { useState, useMemo } from "react";
import {
    Button,
    Popover,
    NumberField,
    Label,
    Description,
    Separator
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BillingLineInstance } from "../../types/pricing";

interface QuantityEditorProps {
    line: BillingLineInstance;
    onSave: (quantity: number) => void;
    isPending?: boolean;
}

export function QuantityEditor({ line, onSave, isPending = false }: QuantityEditorProps) {
    const [value, setValue] = useState<number>(line.quantityInput);
    const [isOpen, setIsOpen] = useState(false);

    const minimumValue = line.appliedRulesSnapshot?.minimum || 0;
    const unit = line.appliedRulesSnapshot?.unit || "units";

    const effectiveQuantity = useMemo(() => {
        return Math.max(value, minimumValue);
    }, [value, minimumValue]);

    const isBelowMinimum = value < minimumValue;

    const handleSave = () => {
        onSave(value);
    };

    // Close popover when not pending anymore if it was pending
    // Better to handle this via parent or a useEffect that watches line.quantityInput change
    React.useEffect(() => {
        if (!isPending) {
            setIsOpen(false);
        }
    }, [line.quantityInput, isPending]);

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger>
                <div className="flex flex-col gap-1 items-start cursor-pointer hover:bg-default-50 p-1 -m-1 rounded-lg transition-colors group">
                    <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold t-compact underline decoration-dotted decoration-default-300 group-hover:decoration-accent group-hover:text-accent">
                            {line.quantityEffective}
                        </span>
                        <span className="text-default-400 t-mini uppercase font-bold">
                            {line.quantityEffective === 1 ? unit.replace(/s$/, '') : unit}
                        </span>
                        {isPending && <Icon icon="lucide:loader-2" className="w-3 h-3 animate-spin text-accent" />}
                    </div>
                    {line.quantityInput !== line.quantityEffective && (
                        <span className="t-micro text-warning-600 font-bold bg-warning-50 pr-1.5 py-0.5 rounded">
                            Rule: Min {minimumValue} applied
                        </span>
                    )}
                </div>
            </Popover.Trigger>
            <Popover.Content className="w-80 p-0 shadow-premium border border-default-200">
                <Popover.Dialog className="p-0">
                    <div className="p-4 bg-default-50/50 border-b border-default-100">
                        <Popover.Heading className="text-sm font-black uppercase tracking-widest text-default-900">
                            Edit Quantity
                        </Popover.Heading>
                        <Description className="text-tiny text-default-500 mt-1">
                            Adjust input quantity. Minimum rules will be applied automatically.
                        </Description>
                    </div>

                    <div className="p-4 space-y-4">
                        <NumberField
                            minValue={0}
                            value={value}
                            onChange={setValue}
                            className="w-full"
                            isDisabled={isPending}
                        >
                            <Label className="text-xs font-bold text-default-700 mb-1.5 block">
                                Input Quantity ({unit})
                            </Label>
                            <NumberField.Group className="bg-background border-default-200 focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent transition-all h-10 px-0">
                                <NumberField.DecrementButton className="p-2 text-default-500 hover:text-accent hover:bg-default-100 transition-colors" />
                                <NumberField.Input className="flex-1 text-center font-mono font-bold text-sm" />
                                <NumberField.IncrementButton className="p-2 text-default-500 hover:text-accent hover:bg-default-100 transition-colors" />
                            </NumberField.Group>
                            {isBelowMinimum && (
                                <div className="mt-2 flex items-start gap-2 p-2 bg-warning-50 rounded-lg text-warning-700 border border-warning-100">
                                    <Icon icon="lucide:info" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span className="text-tiny font-medium leading-relaxed">
                                        Value is below minimum rule ({minimumValue} {unit}). Effective quantity will remain {minimumValue}.
                                    </span>
                                </div>
                            )}
                        </NumberField>

                        <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/10">
                            <div>
                                <span className="text-tiny font-black uppercase tracking-wider text-accent/60 block">Effective Quantity</span>
                                <span className="font-mono font-black text-lg text-accent">{effectiveQuantity} {unit}</span>
                            </div>
                            <div className="text-right">
                                <Icon icon="lucide:calculator" className="w-5 h-5 text-accent/40" />
                            </div>
                        </div>

                        <Separator className="bg-default-100" />

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 font-bold text-default-500"
                                onPress={() => setIsOpen(false)}
                                isDisabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                className="flex-1 font-bold shadow-accent-sm"
                                onPress={handleSave}
                                isDisabled={value === line.quantityInput || isPending}
                            >
                                {isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Icon icon="lucide:loader-2" className="w-3 h-3 animate-spin" />
                                        Saving...
                                    </div>
                                ) : (
                                    "Update Qty"
                                )}
                            </Button>
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
