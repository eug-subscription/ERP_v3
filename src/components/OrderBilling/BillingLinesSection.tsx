import { useState } from "react";
import { Card, Button, Chip, Skeleton, toast, Alert } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useOrderBillingLines } from "../../hooks/useOrderBilling";
import { BillingLinesTable } from "./BillingLinesTable";
import {
    useUpdateBillingLineQuantity,
    useUpdateBillingLineModifiers,
    useAddManualBillingLine
} from "../../hooks/useBillingLineMutations";
import { AddManualLineModal } from "./AddManualLineModal";
import { VoidLineDialog } from "./VoidLineDialog";
import { EmptyState } from "../pricing/EmptyState";
import { BillingLineInstance } from "../../types/pricing";
import { ICON_CONTAINER_LG, ICON_SIZE_CONTAINER, TEXT_SECTION_TITLE } from "../../constants/ui-tokens";

interface BillingLinesSectionProps {
    orderId: string;
    projectId: string;
}

export function BillingLinesSection({
    orderId,
    projectId
}: BillingLinesSectionProps) {
    const { state, actions } = useOrderBillingLines(orderId);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);
    const [lineToVoid, setLineToVoid] = useState<BillingLineInstance | null>(null);

    const updateQuantity = useUpdateBillingLineQuantity();
    const updateModifiers = useUpdateBillingLineModifiers();
    const addManualLine = useAddManualBillingLine();



    if (state.isError) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Billing Lines</Alert.Title>
                    <Alert.Description>Failed to fetch billing data. Please try again.</Alert.Description>
                    <Button
                        size="sm"
                        variant="danger-soft"
                        onPress={() => actions.refetch()}
                        className="font-bold mt-2"
                    >
                        Retry
                    </Button>
                </Alert.Content>
            </Alert>
        );
    }

    return (
        <Card className="overflow-x-auto">
            <Card.Header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 gap-4 border-b border-default-200 bg-default-50/50">
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-4">
                        <div className={ICON_CONTAINER_LG}>
                            <Icon icon="lucide:receipt" className={ICON_SIZE_CONTAINER} />
                        </div>
                        <div>
                            <h2 className={`${TEXT_SECTION_TITLE} flex items-center gap-3`}>
                                Billing Lines
                                {state.isLoading ? (
                                    <Skeleton className="w-10 h-6 rounded-full" />
                                ) : (
                                    <Chip size="sm" variant="soft" color="accent" className="font-black px-2">
                                        {state.lines.length}
                                    </Chip>
                                )}
                            </h2>
                            <p className="text-xs text-default-400 font-medium">
                                Manage revenue and expense lines for this order
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            className="shadow-accent-md font-bold px-6 h-12 rounded-xl"
                            onPress={() => setIsAddModalOpen(true)}
                            isPending={addManualLine.isPending}
                        >
                            <Icon icon="lucide:plus" className="w-5 h-5 mr-2" />
                            Add Manual Line
                        </Button>
                    </div>
                </div>
            </Card.Header>

            <Card.Content className="p-0">
                {state.isLoading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="w-full h-16 rounded-lg" />
                        ))}
                    </div>
                ) : state.lines.length > 0 ? (
                    <BillingLinesTable
                        lines={state.lines}
                        updatingQuantityId={updateQuantity.isPending ? updateQuantity.variables?.id : null}
                        updatingModifiersId={updateModifiers.isPending ? updateModifiers.variables?.id : null}
                        onEditQuantity={(line) => {
                            updateQuantity.mutate({
                                id: line.id,
                                quantityInput: line.quantityInput
                            }, {
                                onSuccess: () => {
                                    toast("Quantity Updated", {
                                        variant: "success",
                                        description: `Successfully updated quantity for billing line ${line.id}.`
                                    });
                                },
                                onError: (error: Error) => {
                                    toast("Update Failed", {
                                        variant: "danger",
                                        description: error.message || "Could not update quantity."
                                    });
                                }
                            });
                        }}
                        onEditModifiers={(line) => {
                            // Extract only the modifier fields from the line
                            const {
                                clientModifierValue, clientModifierReasonCode, clientModifierNote, clientModifierSource,
                                costModifierValue, costModifierReasonCode, costModifierNote, costModifierSource
                            } = line;

                            updateModifiers.mutate({
                                id: line.id,
                                updates: {
                                    clientModifierValue, clientModifierReasonCode, clientModifierNote, clientModifierSource,
                                    costModifierValue, costModifierReasonCode, costModifierNote, costModifierSource
                                }
                            }, {
                                onSuccess: () => {
                                    toast("Modifiers Saved", {
                                        variant: "success",
                                        description: `Successfully updated pricing modifiers for billing line ${line.id}.`
                                    });
                                },
                                onError: (error: Error) => {
                                    toast("Save Failed", {
                                        variant: "danger",
                                        description: error.message || "Could not save pricing modifiers."
                                    });
                                }
                            });
                        }}
                        onVoidLine={(line) => {
                            setLineToVoid(line);
                            setIsVoidDialogOpen(true);
                        }}
                    />
                ) : (
                    <div className="p-8">
                        <EmptyState
                            icon="lucide:search-x"
                            title="No Billing Lines Found"
                            description="No billing lines yet. Add items from your rate card or create manual entries."
                            actionLabel="Add Manual Line"
                            actionIcon="lucide:plus"
                            onAction={() => setIsAddModalOpen(true)}
                        />
                    </div>
                )}
            </Card.Content>

            <AddManualLineModal
                orderId={orderId}
                projectId={projectId}
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                isPending={addManualLine.isPending}
                onAdd={(line) => addManualLine.mutate(line, {
                    onSuccess: () => {
                        toast("Manual Line Added", {
                            variant: "success",
                            description: `Successfully added manual line to the order.`
                        });
                        setIsAddModalOpen(false);
                    },
                    onError: (error: Error) => {
                        toast("Add Failed", {
                            variant: "danger",
                            description: error.message || "Could not add manual billing line."
                        });
                    }
                })}
            />



            <VoidLineDialog
                line={lineToVoid}
                isOpen={isVoidDialogOpen}
                onOpenChange={setIsVoidDialogOpen}
            />
        </Card>
    );
}
