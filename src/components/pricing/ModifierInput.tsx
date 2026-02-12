import { NumberField, Label, Button, Description, FieldError } from "@heroui/react";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";

interface ModifierInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    description?: string;
    isInvalid?: boolean;
    errorMessage?: string;
    minValue?: number;
    maxValue?: number;
    className?: string;
}

/**
 * ModifierInput - Specialized input for price modifiers (1.0 = 100%).
 * Includes quick-adjustment buttons and percentage formatting.
 */
export function ModifierInput({
    label,
    value,
    onChange,
    description,
    isInvalid,
    errorMessage,
    minValue = 0.01,
    maxValue = 10,
    className = ""
}: ModifierInputProps) {
    /** Adjusts the modifier by a fixed percentage point amount */
    const handleQuickAdjust = (amount: number) => {
        if (amount === 0) {
            onChange(1.0);
        } else {
            // Respect the dynamic bounds
            const newValue = Math.max(minValue, value + amount);
            onChange(Math.min(maxValue, newValue));
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <NumberField
                value={value}
                onChange={onChange}
                minValue={minValue}
                maxValue={maxValue}
                step={0.01}
                formatOptions={{ style: 'percent' }}
                isInvalid={isInvalid}
                className="w-full"
            >
                <Label className={PRICING_LABEL_CLASSES}>{label}</Label>
                <NumberField.Group className="flex items-center">
                    <NumberField.DecrementButton />
                    <NumberField.Input className="flex-grow font-mono font-bold text-center" />
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
                    onPress={() => handleQuickAdjust(-0.1)}
                    aria-label="Decrease by 10%"
                >
                    -10%
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 min-w-16 px-1 t-mini font-bold shadow-sm"
                    onPress={() => handleQuickAdjust(0)}
                    aria-label="Reset to standard 100%"
                >
                    Std (1.0)
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                    onPress={() => handleQuickAdjust(0.1)}
                    aria-label="Increase by 10%"
                >
                    +10%
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 min-w-10 px-1 t-mini font-bold border border-default-200"
                    onPress={() => handleQuickAdjust(0.5)}
                    aria-label="Increase by 50%"
                >
                    +50%
                </Button>
            </div>
        </div>
    );
}
