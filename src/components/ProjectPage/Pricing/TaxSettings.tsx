import { useState, useMemo, useEffect } from "react";
import {
    RadioGroup,
    Radio,
    NumberField,
    TextField,
    Input,
    InputGroup,
    Label
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { TaxTreatment } from "../../../types/pricing";
import { TAX_RATE_PERCENTAGE_FACTOR, decimalToPercent } from "../../../constants/pricing-data";

interface TaxSettingsData {
    taxTreatment: TaxTreatment;
    taxRate: number;
    taxNumber?: string;
}

interface TaxSettingsProps {
    initialData: {
        taxTreatment: TaxTreatment;
        taxRate: number;
        taxNumber?: string;
    };
    onChange?: (data: TaxSettingsData) => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * TaxSettings - Independent configuration for project tax protocol.
 * Refactored to remove currency selection (now derived from Rate Card).
 */
export function TaxSettings({
    initialData,
    onDirtyChange,
    onChange
}: TaxSettingsProps) {
    const [taxTreatment, setTaxTreatment] = useState<TaxTreatment>(initialData.taxTreatment);
    const [taxRate, setTaxRate] = useState<number>(decimalToPercent(initialData.taxRate));
    const [taxNumber, setTaxNumber] = useState(initialData.taxNumber || "");
    const [taxRateError, setTaxRateError] = useState<string | null>(null);

    const isDirty = useMemo(() => {
        return (
            taxTreatment !== initialData.taxTreatment ||
            Math.round(taxRate) !== Math.round(decimalToPercent(initialData.taxRate)) ||
            taxNumber !== (initialData.taxNumber || "")
        );
    }, [taxTreatment, taxRate, taxNumber, initialData]);

    useEffect(() => {
        onDirtyChange?.(isDirty);
        onChange?.({
            taxTreatment,
            taxRate: taxRate / TAX_RATE_PERCENTAGE_FACTOR,
            taxNumber
        });
    }, [isDirty, onDirtyChange, onChange, taxTreatment, taxRate, taxNumber]);

    const handleTaxRateChange = (val: number) => {
        if (val < 0 || val > 100) {
            setTaxRateError("Tax rate must be between 0% and 100%");
        } else {
            setTaxRateError(null);
        }
        setTaxRate(val);
    };

    return (
        <div className="space-y-4">
            {/* Taxation Protocol Section */}
            <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon icon="lucide:percent" className="size-5 text-accent" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Tax Settings</h3>
                    <p className="text-xs text-default-400 font-medium">Configure tax treatment and registration details</p>
                </div>
            </div>

            {/* Aligned with title text */}
            <div className="ml-14 space-y-8">
                {/* Tax Treatment Selection */}
                <div className="space-y-4">
                    <RadioGroup
                        value={taxTreatment}
                        onChange={(val: string) => setTaxTreatment(val as TaxTreatment)}
                        className="flex flex-col gap-2 w-full"
                    >
                        <Label className="t-mini font-bold uppercase tracking-[0.15em] text-default-400">Treatment Method</Label>
                        <div className="flex flex-row gap-4 w-full">
                            <Radio
                                value="exclusive"
                                className={`flex-1 m-0 h-24 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-0
                                    ${taxTreatment === 'exclusive' ? 'bg-accent/5 border-accent shadow-sm shadow-accent/10' : 'bg-default-100/50 border-transparent hover:bg-default-100 hover:border-default-200'}
                                `}
                            >
                                <Radio.Control className="sr-only">
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content className="flex flex-col items-center justify-center">
                                    <div className={`size-10 rounded-xl mb-2 flex items-center justify-center transition-colors ${taxTreatment === 'exclusive' ? 'bg-accent/20 text-accent' : 'bg-default-100 text-default-400'}`}>
                                        <Icon icon="lucide:plus-circle" className="size-5" />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${taxTreatment === 'exclusive' ? 'text-accent' : 'text-default-500'}`}>Exclusive</span>
                                </Radio.Content>
                            </Radio>
                            <Radio
                                value="inclusive"
                                className={`flex-1 m-0 h-24 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center p-0
                                    ${taxTreatment === 'inclusive' ? 'bg-accent/5 border-accent shadow-sm shadow-accent/10' : 'bg-default-100/50 border-transparent hover:bg-default-100 hover:border-default-200'}
                                `}
                            >
                                <Radio.Control className="sr-only">
                                    <Radio.Indicator />
                                </Radio.Control>
                                <Radio.Content className="flex flex-col items-center justify-center">
                                    <div className={`size-10 rounded-xl mb-2 flex items-center justify-center transition-colors ${taxTreatment === 'inclusive' ? 'bg-accent/20 text-accent' : 'bg-default-100 text-default-400'}`}>
                                        <Icon icon="lucide:minus-circle" className="size-5" />
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${taxTreatment === 'inclusive' ? 'text-accent' : 'text-default-500'}`}>Inclusive</span>
                                </Radio.Content>
                            </Radio>
                        </div>
                    </RadioGroup>
                </div>

                {/* Tax Rate & Number - Unified Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <NumberField
                        value={taxRate}
                        onChange={handleTaxRateChange}
                        minValue={0}
                        maxValue={100}
                        isInvalid={!!taxRateError}
                        className="w-full"
                    >
                        <Label className="t-mini font-bold uppercase tracking-[0.15em] text-default-400">Tax Rate</Label>
                        <InputGroup fullWidth>
                            <NumberField.Input />
                            <InputGroup.Suffix>%</InputGroup.Suffix>
                        </InputGroup>
                        {taxRateError && (
                            <p className="text-xs text-danger mt-1 ml-1">{taxRateError}</p>
                        )}
                    </NumberField>

                    <TextField
                        value={taxNumber}
                        onChange={setTaxNumber}
                        className="w-full group"
                    >
                        <Label className="t-mini font-bold uppercase tracking-[0.15em] text-default-400">Tax Registration ID</Label>
                        <Input placeholder="e.g. GB-123456789" />
                    </TextField>
                </div>
            </div>
        </div>
    );
}
