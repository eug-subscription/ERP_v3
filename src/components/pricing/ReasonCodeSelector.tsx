import { Label, ListBox, Select, Description, FieldError } from "@heroui/react";
import { ModifierReasonCode } from "../../types/pricing";
import { PRICING_LABEL_CLASSES } from "../../constants/pricing";
import { Key } from "react";

interface ReasonCodeSelectorProps {
    value: string | undefined | null;
    onChange: (code: string) => void;
    reasonCodes: ModifierReasonCode[]; // Data passed via props for API-ready architecture
    required?: boolean;
    filterActive?: boolean;
    isInvalid?: boolean;
    errorMessage?: string;
    description?: string;
    className?: string;
    label?: string;
    placeholder?: string;
}

/**
 * ReasonCodeSelector - Dropdown for selecting modifier reason codes.
 * Pure component receiving data via props.
 * Follows erp_pricing_spec_v1_7.md Section 9.5.
 */
export function ReasonCodeSelector({
    value,
    onChange,
    reasonCodes,
    required = false,
    filterActive = true,
    isInvalid = false,
    errorMessage,
    description,
    className = "",
    label = "Reason Code",
    placeholder = "Select reason...",
}: ReasonCodeSelectorProps) {
    const reasons = reasonCodes.filter((r) =>
        filterActive ? r.active : true
    );

    const handleSelectionChange = (key: Key | null) => {
        if (key) onChange(key.toString());
    };

    return (
        <Select
            className={`w-full ${className}`}
            placeholder={placeholder}
            selectedKey={value ?? undefined}
            onSelectionChange={handleSelectionChange}
            isRequired={required}
            isInvalid={isInvalid}
        >
            <Label className={PRICING_LABEL_CLASSES}>
                {label}
            </Label>
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>

            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>

            <Select.Popover>
                <ListBox items={reasons}>
                    {(reason) => (
                        <ListBox.Item
                            id={reason.code}
                            key={reason.code}
                            textValue={reason.displayName}
                            className="flex flex-col gap-0.5 py-2"
                        >
                            <span className="text-sm font-semibold">{reason.displayName}</span>
                            <span className="t-mini font-mono leading-none opacity-60 uppercase tracking-tighter">
                                Code: {reason.code}
                            </span>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </Select.Popover>
        </Select>
    );
}
