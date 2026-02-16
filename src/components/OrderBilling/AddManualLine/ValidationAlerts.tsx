import { Alert } from "@heroui/react";
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
                <Alert status="danger" className="animate-in slide-in-from-top-2">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>No Active Rate Card</Alert.Title>
                        <Alert.Description>
                            This project does not have an active rate card assigned. Please configure project pricing before adding manual lines.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            ) : (
                availableRateItems.length === 0 && (
                    <Alert status="warning" className="animate-in slide-in-from-top-2">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No Billable Items Available</Alert.Title>
                            <Alert.Description>
                                The assigned rate card <strong>{rateCards.find(rc => rc.id === pricingSettings.rateCardId)?.name}</strong> has no active rate items. Add entries to the rate card in Rate Management first.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                )
            )}
        </div>
    );
}
