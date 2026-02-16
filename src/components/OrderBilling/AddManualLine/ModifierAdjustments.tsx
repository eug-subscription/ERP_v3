import { Card } from "@heroui/react";
import { ModifierInput } from "../../pricing/ModifierInput";
import { ReasonCodeSelector } from "../../pricing/ReasonCodeSelector";
import { ModifierReasonCode, ModifierType } from "../../../types/pricing";
import {
    CLIENT_MODIFIER_MIN,
    CLIENT_MODIFIER_MAX,
    COST_MODIFIER_MIN,
    COST_MODIFIER_MAX,
} from "../../../constants/pricing";

interface ModifierAdjustmentsProps {
    clientModifier: number;
    setClientModifier: (value: number) => void;
    clientModifierType: ModifierType;
    setClientModifierType: (type: ModifierType) => void;
    clientModifierFixedAmount: number | null;
    setClientModifierFixedAmount: (amount: number | null) => void;
    clientReasonCode: string | null;
    setClientReasonCode: (code: string | null) => void;
    costModifier: number;
    setCostModifier: (value: number) => void;
    costModifierType: ModifierType;
    setCostModifierType: (type: ModifierType) => void;
    costModifierFixedAmount: number | null;
    setCostModifierFixedAmount: (amount: number | null) => void;
    costReasonCode: string | null;
    setCostReasonCode: (code: string | null) => void;
    reasonCodes: ModifierReasonCode[];
    currency: string;
    isClientModifierActive: boolean;
    isCostModifierActive: boolean;
}

export function ModifierAdjustments({
    clientModifier,
    setClientModifier,
    clientModifierType,
    setClientModifierType,
    clientModifierFixedAmount,
    setClientModifierFixedAmount,
    clientReasonCode,
    setClientReasonCode,
    costModifier,
    setCostModifier,
    costModifierType,
    setCostModifierType,
    costModifierFixedAmount,
    setCostModifierFixedAmount,
    costReasonCode,
    setCostReasonCode,
    reasonCodes,
    currency,
    isClientModifierActive,
    isCostModifierActive,
}: ModifierAdjustmentsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <Card.Header>
                    <Card.Title>Revenue Adjustments</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-3">
                    <ModifierInput
                        type={clientModifierType}
                        onTypeChange={setClientModifierType}
                        value={clientModifier}
                        onValueChange={setClientModifier}
                        fixedAmount={clientModifierFixedAmount}
                        onFixedAmountChange={setClientModifierFixedAmount}
                        currency={currency}
                        minValue={CLIENT_MODIFIER_MIN}
                        maxValue={CLIENT_MODIFIER_MAX}
                    />
                    <ReasonCodeSelector
                        value={clientReasonCode}
                        onChange={setClientReasonCode}
                        reasonCodes={reasonCodes}
                        required={isClientModifierActive}
                        label="Revenue Reason Code"
                    />
                </Card.Content>
            </Card>

            <Card>
                <Card.Header>
                    <Card.Title>Expense Adjustments</Card.Title>
                </Card.Header>
                <Card.Content className="space-y-3">
                    <ModifierInput
                        type={costModifierType}
                        onTypeChange={setCostModifierType}
                        value={costModifier}
                        onValueChange={setCostModifier}
                        fixedAmount={costModifierFixedAmount}
                        onFixedAmountChange={setCostModifierFixedAmount}
                        currency={currency}
                        minValue={COST_MODIFIER_MIN}
                        maxValue={COST_MODIFIER_MAX}
                    />
                    <ReasonCodeSelector
                        value={costReasonCode}
                        onChange={setCostReasonCode}
                        reasonCodes={reasonCodes}
                        required={isCostModifierActive}
                        label="Expense Reason Code"
                    />
                </Card.Content>
            </Card>
        </div>
    );
}
