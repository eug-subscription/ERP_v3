import { ModifierInput } from "../../pricing/ModifierInput";
import { ReasonCodeSelector } from "../../pricing/ReasonCodeSelector";
import { ModifierReasonCode } from "../../../types/pricing";

interface ModifierAdjustmentsProps {
    clientModifier: number;
    setClientModifier: (value: number) => void;
    clientReasonCode: string | null;
    setClientReasonCode: (code: string | null) => void;
    costModifier: number;
    setCostModifier: (value: number) => void;
    costReasonCode: string | null;
    setCostReasonCode: (code: string | null) => void;
    reasonCodes: ModifierReasonCode[];
}

export function ModifierAdjustments({
    clientModifier,
    setClientModifier,
    clientReasonCode,
    setClientReasonCode,
    costModifier,
    setCostModifier,
    costReasonCode,
    setCostReasonCode,
    reasonCodes,
}: ModifierAdjustmentsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 border border-default-100 rounded-2xl bg-default-50/50">
                <h4 className="text-xs font-black uppercase tracking-widest text-default-400">Revenue Adjustments</h4>
                <ModifierInput
                    label="Revenue Modifier"
                    value={clientModifier}
                    onChange={setClientModifier}
                />
                <ReasonCodeSelector
                    value={clientReasonCode}
                    onChange={setClientReasonCode}
                    reasonCodes={reasonCodes}
                    required={clientModifier !== 1.0}
                    label="Revenue Reason Code"
                />
            </div>

            <div className="space-y-4 p-4 border border-default-100 rounded-2xl bg-default-50/50">
                <h4 className="text-xs font-black uppercase tracking-widest text-default-400">Expense Adjustments</h4>
                <ModifierInput
                    label="Expense Modifier"
                    value={costModifier}
                    onChange={setCostModifier}
                />
                <ReasonCodeSelector
                    value={costReasonCode}
                    onChange={setCostReasonCode}
                    reasonCodes={reasonCodes}
                    required={costModifier !== 1.0}
                    label="Expense Reason Code"
                />
            </div>
        </div>
    );
}
