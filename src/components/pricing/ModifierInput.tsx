import { NumberField, Label, Button, Tabs, Description, FieldError } from "@heroui/react";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";
import { ModifierType } from "../../types/pricing";
import { getCurrencySymbol } from "../../utils/currency";

interface ModifierInputProps {
    label?: string;
    type: ModifierType;
    onTypeChange: (type: ModifierType) => void;
    value: number; // percentage value
    onValueChange: (value: number) => void;
    fixedAmount: number | null;
    onFixedAmountChange: (amount: number | null) => void;
    currency: string;
    minValue?: number;
    maxValue?: number;
    description?: string;
    isInvalid?: boolean;
    errorMessage?: string;
    className?: string;
}

/**
 * ModifierInput - Specialized input for price modifiers.
 * Supports switching between Percentage (multiplicative) and Fixed Amount (additive).
 */
export function ModifierInput({
    label,
    type,
    onTypeChange,
    value,
    onValueChange,
    fixedAmount,
    onFixedAmountChange,
    currency,
    minValue = 0.01,
    maxValue = 10,
    description,
    isInvalid,
    errorMessage,
    className = ""
}: ModifierInputProps) {

    const handleQuickAdjustPercentage = (amount: number) => {
        if (amount === 0) {
            onValueChange(1.0);
        } else {
            const newValue = Math.max(minValue, value + amount);
            onValueChange(Math.min(maxValue, newValue));
        }
    };

    const handleQuickAdjustFixed = (amount: number) => {
        const currentCheck = fixedAmount ?? 0;
        if (amount === 0) {
            onFixedAmountChange(null); // Reset
        } else {
            onFixedAmountChange((currentCheck) + amount);
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div className="flex items-center justify-between">
                {label && <Label className={PRICING_LABEL_CLASSES}>{label}</Label>}
                <Tabs
                    selectedKey={type}
                    onSelectionChange={(key) => onTypeChange(key as ModifierType)}
                    className="w-full"
                    hideSeparator
                >
                    <Tabs.ListContainer>
                        <Tabs.List aria-label="Modifier type">
                            <Tabs.Tab id="percentage" className="whitespace-nowrap">
                                % Percent
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="fixed" className="whitespace-nowrap">
                                {getCurrencySymbol(currency)} Fixed
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>

            {type === 'percentage' ? (
                <>
                    <NumberField
                        value={value}
                        onChange={onValueChange}
                        minValue={minValue}
                        maxValue={maxValue}
                        step={0.01}
                        formatOptions={{ style: 'percent' }}
                        isInvalid={isInvalid}
                        className="w-full"
                    >
                        <NumberField.Group>
                            <NumberField.DecrementButton />
                            <NumberField.Input />
                            <NumberField.IncrementButton />
                        </NumberField.Group>
                        {description && <Description className="t-mini italic">{description}</Description>}
                        <FieldError className="t-mini text-danger">{errorMessage}</FieldError>
                    </NumberField>

                    <div className="flex flex-wrap gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustPercentage(-0.5)}
                        >
                            -50%
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustPercentage(-0.1)}
                        >
                            -10%
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 min-w-16 px-1 t-mini font-bold shadow-sm"
                            onPress={() => handleQuickAdjustPercentage(0)}
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustPercentage(0.1)}
                        >
                            +10%
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustPercentage(0.5)}
                        >
                            +50%
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <NumberField
                        value={fixedAmount ?? 0}
                        onChange={(val) => onFixedAmountChange(val)}
                        formatOptions={
                            // Only use currency formatting if we have a valid currency code
                            currency && ['EUR', 'GBP', 'USD'].includes(currency)
                                ? {
                                    style: 'currency',
                                    currency: currency,
                                    currencyDisplay: 'symbol'
                                }
                                : {
                                    style: 'decimal',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                        }
                        isInvalid={isInvalid}
                        className="w-full"
                    >
                        <NumberField.Group>
                            <NumberField.DecrementButton />
                            <NumberField.Input />
                            <NumberField.IncrementButton />
                        </NumberField.Group>
                        {description && <Description className="t-mini italic">{description}</Description>}
                        <FieldError className="t-mini text-danger">{errorMessage}</FieldError>
                    </NumberField>


                    <div className="flex flex-wrap gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(-50)}
                        >
                            -{getCurrencySymbol(currency)}50
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(-25)}
                        >
                            -{getCurrencySymbol(currency)}25
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(-10)}
                        >
                            -{getCurrencySymbol(currency)}10
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 min-w-16 px-1 t-mini font-bold shadow-sm"
                            onPress={() => handleQuickAdjustFixed(0)}
                        >
                            None
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(10)}
                        >
                            +{getCurrencySymbol(currency)}10
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(25)}
                        >
                            +{getCurrencySymbol(currency)}25
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                            onPress={() => handleQuickAdjustFixed(50)}
                        >
                            +{getCurrencySymbol(currency)}50
                        </Button>
                    </div>
                </>
            )}


        </div>
    );
}


