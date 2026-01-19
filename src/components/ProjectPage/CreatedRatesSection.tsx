import { useState } from "react";
import { Card, Tooltip, Button, AlertDialog } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Rate } from "../../data/mock-project";

interface CreatedRatesSectionProps {
    title: string;
    rates: Rate[];
    createdRateIds: string[];
    onEditRate: (rateId: string) => void;
    onDeleteRate: (rateId: string) => void;
    /** Optional: Show type and level info (for retouching) */
    showTypeInfo?: {
        type: "ai" | "human";
        level: "standard" | "advanced" | "premium";
    };
}

/**
 * Displays a list of newly created rates with edit and delete buttons.
 * Only shows rates that were created in this session (tracked by createdRateIds).
 */
export function CreatedRatesSection({
    title,
    rates,
    createdRateIds,
    onEditRate,
    onDeleteRate,
    showTypeInfo,
}: CreatedRatesSectionProps) {
    const [rateToDelete, setRateToDelete] = useState<string | null>(null);

    // Filter to only show rates that were created in this session
    const createdRates = rates.filter((rate) => createdRateIds.includes(rate.id));

    const handleDelete = (id: string) => {
        onDeleteRate(id);
        setRateToDelete(null);
    };

    if (createdRates.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-default-700">{title}</h4>
            <div className="space-y-2">
                {createdRates.map((rate) => (
                    <Card
                        key={rate.id}
                        className="p-0 border border-default-200 shadow-none rounded-xl group hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-300 w-fit min-w-[280px]"
                    >
                        <Card.Content className="px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                    <span className="font-semibold text-foreground truncate">
                                        {rate.name}
                                    </span>
                                    <span className="text-xs text-default-500 whitespace-nowrap">
                                        {showTypeInfo && (
                                            <>
                                                <span className="capitalize">{showTypeInfo.level}</span>
                                                {" • "}
                                                <span>{showTypeInfo.type === "ai" ? "AI" : "Human"}</span>
                                                {" • "}
                                            </>
                                        )}
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: rate.currency,
                                        }).format(rate.amount)}{" "}
                                        {rate.unit}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 pr-1">
                                    <Tooltip>
                                        <Tooltip.Trigger>
                                            <Button
                                                isIconOnly
                                                variant="tertiary"
                                                size="sm"
                                                onPress={() => onEditRate(rate.id)}
                                                className="bg-default-100/50 hover:bg-accent/10 border-none shadow-none text-default-500 hover:text-accent opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100"
                                            >
                                                <Icon icon="lucide:pencil" width={16} />
                                            </Button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content offset={10}>
                                            Edit Rate
                                        </Tooltip.Content>
                                    </Tooltip>

                                    <Tooltip>
                                        <Tooltip.Trigger>
                                            <Button
                                                isIconOnly
                                                variant="tertiary"
                                                size="sm"
                                                onPress={() => setRateToDelete(rate.id)}
                                                className="bg-default-100/50 hover:bg-danger/10 border-none shadow-none text-default-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100"
                                            >
                                                <Icon icon="lucide:trash-2" width={16} />
                                            </Button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content offset={10}>
                                            Delete Rate
                                        </Tooltip.Content>
                                    </Tooltip>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                ))}
            </div>

            <AlertDialog
                isOpen={rateToDelete !== null}
                onOpenChange={(open) => !open && setRateToDelete(null)}
            >
                <AlertDialog.Backdrop variant="blur">
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                                <AlertDialog.Icon status="danger" />
                                <AlertDialog.Heading>Delete Rate?</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                <p className="text-default-500 text-sm">
                                    Are you sure you want to delete this custom rate? This action cannot be undone and will remove it from this project's configuration.
                                </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button
                                    variant="tertiary"
                                    onPress={() => setRateToDelete(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onPress={() => rateToDelete && handleDelete(rateToDelete)}
                                >
                                    Delete Rate
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </div>
    );
}
