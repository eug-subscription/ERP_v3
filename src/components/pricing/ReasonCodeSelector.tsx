import { Label, ListBox, ComboBox, Input, Description, FieldError } from "@heroui/react";
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
 * ReasonCodeSelector - Searchable dropdown for selecting modifier reason codes.
 * Pure component receiving data via props.
 * Follows erp_pricing_spec_v1_7.md Section 9.5.
 * Uses ComboBox for search/filter functionality.
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
    placeholder = "Search or select reason...",
}: ReasonCodeSelectorProps) {
    const reasons = reasonCodes.filter((r) =>
        filterActive ? r.active : true
    );

    const handleSelectionChange = (key: Key | null) => {
        if (key) onChange(key.toString());
    };

    return (
        <ComboBox
            className={`w-full ${className}`}
            selectedKey={value ?? undefined}
            onSelectionChange={handleSelectionChange}
            isRequired={required}
            isInvalid={isInvalid}
        >
            <Label className={PRICING_LABEL_CLASSES}>
                {label}
            </Label>
            <ComboBox.InputGroup>
                <Input placeholder={placeholder} />
                <ComboBox.Trigger />
            </ComboBox.InputGroup>

            {description && <Description>{description}</Description>}
            <FieldError>{errorMessage}</FieldError>

            <ComboBox.Popover>
                <ListBox items={reasons}>
                    {(reason) => (
                        <ListBox.Item
                            id={reason.code}
                            key={reason.code}
                            textValue={`${reason.code} - ${reason.displayName}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono uppercase font-bold">{reason.code}</span>
                                <span className="text-sm text-default-500 truncate">{reason.displayName}</span>
                            </div>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    )}
                </ListBox>
            </ComboBox.Popover>
        </ComboBox>
    );
}
