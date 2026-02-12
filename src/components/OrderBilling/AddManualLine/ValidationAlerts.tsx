import { Icon } from "@iconify/react";
import { RateCard, RateItem } from "../../../types/pricing";

interface ValidationAlertsProps {
    isLoading: boolean;
    pricingSettings: { rateCardId: string | null } | null | undefined;
    availableRateItems: RateItem[];
    rateCards: RateCard[];
}

export function ValidationAlerts({
    isLoading,
    pricingSettings,
    availableRateItems,
    rateCards,
}: ValidationAlertsProps) {
    if (isLoading) return null;

    return (
        <div className="space-y-4">
            {!pricingSettings?.rateCardId ? (
                <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 flex items-start gap-4 animate-in slide-in-from-top-2">
                    <Icon icon="lucide:alert-circle" className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                        <h5 className="font-bold text-danger-900 text-sm">No Active Rate Card</h5>
                        <p className="text-xs text-danger-700 leading-relaxed font-medium">
                            This project does not have an active rate card assigned. Please configure project pricing before adding manual lines.
                        </p>
                    </div>
                </div>
            ) : (
                availableRateItems.length === 0 && (
                    <div className="p-4 rounded-xl bg-warning-50 border border-warning-200 flex items-start gap-4 animate-in slide-in-from-top-2">
                        <Icon icon="lucide:info" className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                        <div>
                            <h5 className="font-bold text-warning-900 text-sm">No Billable Items Available</h5>
                            <p className="text-xs text-warning-700 leading-relaxed font-medium">
                                The assigned rate card <strong>{rateCards.find(rc => rc.id === pricingSettings.rateCardId)?.name}</strong> has no active rate items. Add entries to the rate card in Rate Management first.
                            </p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
