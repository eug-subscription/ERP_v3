import { useMemo, useState, useCallback, useEffect } from "react";
import {
    Modal,
    Button,
    ComboBox,
    Input,
    TextArea,
    Label,
    ListBox,
    Skeleton,
    Alert,
    AlertDialog,
    Form,
    TextField,
    Description,
    FieldError,
    Surface,
    ScrollShadow,
    InputGroup,
    Card
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRateCards } from "../../../hooks/useRateCards";
import { useRateItems } from "../../../hooks/useRateItems";
import {
    useAddProjectOverride,
    useUpdateProjectOverride,
    useRemoveProjectOverride,
    useProjectOverrides
} from "../../../hooks/useProjectOverrides";
import { ProjectPricingOverride, Currency } from "../../../types/pricing";
import { CurrencyDisplay } from "../../pricing/CurrencyDisplay";
import { SKELETON_FIELD_HEIGHT, SKELETON_AREA_HEIGHT } from "../../../constants/ui-tokens";
import { CURRENCY_INPUT_STEP, OVERRIDE_REASON_MAX_LENGTH } from "../../../constants/pricing";
import { sidebarModalStyles } from "../../../styles/modal-variants";
import { getCurrencySymbol } from "../../../utils/currency";

interface OverrideModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    currency: Currency;
    rateCardId: string;
    override?: ProjectPricingOverride | null;
}


/**
 * OverrideModal - Unified modal for adding and editing project-level rate overrides.
 * Handles both add mode (override=undefined) and edit mode (override provided).
 * Uses sidebarModalStyles for right-aligned drawer pattern.
 */
export function OverrideModal({
    isOpen,
    onOpenChange,
    projectId,
    currency,
    rateCardId,
    override
}: OverrideModalProps) {
    const styles = sidebarModalStyles({ isOpen });
    const isEditMode = !!override;

    const { data: rateCards, isLoading: isCardsLoading } = useRateCards(currency);
    const { data: rateItems, isLoading: isItemsLoading } = useRateItems();
    const { data: existingOverrides, isLoading: isOverridesLoading } = useProjectOverrides(projectId);
    const addMutation = useAddProjectOverride();
    const updateMutation = useUpdateProjectOverride();
    const deleteMutation = useRemoveProjectOverride();

    // Validation state (track if user has attempted to submit)
    const [attempted, setAttempted] = useState(false);

    // Delete confirmation dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Initialize form state from override prop (edit mode) or empty (add mode)
    const initialFormState = useMemo(() => ({
        rateItemId: override?.rateItemId || null,
        costRate: override?.costRate,
        clientRate: override?.clientRate,
        reason: override?.reason || ""
    }), [override?.rateItemId, override?.costRate, override?.clientRate, override?.reason]);

    const [selectedRateItemId, setSelectedRateItemId] = useState<string | null>(initialFormState.rateItemId);
    const [costRate, setCostRate] = useState<number | undefined>(initialFormState.costRate);
    const [clientRate, setClientRate] = useState<number | undefined>(initialFormState.clientRate);
    const [reason, setReason] = useState(initialFormState.reason);

    // Sync form state when override prop changes (edit mode switching between overrides)
    // This is the React-documented pattern for "resetting state when a prop changes"
    // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    /* eslint-disable react-hooks/set-state-in-effect -- Intentional: syncing form state with prop-derived initial values */
    useEffect(() => {
        setSelectedRateItemId(initialFormState.rateItemId);
        setCostRate(initialFormState.costRate);
        setClientRate(initialFormState.clientRate);
        setReason(initialFormState.reason);
        setAttempted(false);
    }, [initialFormState]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Reset form to initial state (used in onSuccess callbacks)
    const resetForm = useCallback(() => {
        setSelectedRateItemId(initialFormState.rateItemId);
        setCostRate(initialFormState.costRate);
        setClientRate(initialFormState.clientRate);
        setReason(initialFormState.reason);
        setAttempted(false);
    }, [initialFormState]);

    const isLoading = isCardsLoading || isItemsLoading || isOverridesLoading;

    // Find the current rate card to filter items
    const currentRateCard = useMemo(() => {
        return rateCards?.find(rc => rc.id === rateCardId);
    }, [rateCards, rateCardId]);

    // Find the base entry for the selected item to show defaults
    const selectedBaseEntry = useMemo(() => {
        if (!selectedRateItemId || !currentRateCard) return null;
        return currentRateCard.entries.find(e => e.rateItemId === selectedRateItemId);
    }, [selectedRateItemId, currentRateCard]);

    // Find the selected rate item for details display
    const selectedRateItem = useMemo(() => {
        if (!selectedRateItemId || !rateItems) return null;
        return rateItems.find(item => item.id === selectedRateItemId);
    }, [selectedRateItemId, rateItems]);

    // Prepare options for the ComboBox - filter out items that already have overrides (except current in edit mode)
    const rateItemOptions = useMemo(() => {
        if (!currentRateCard || !rateItems) return [];

        // Get set of rate item IDs that already have overrides
        const overriddenItemIds = new Set(
            (existingOverrides || [])
                .filter(ov => !isEditMode || ov.id !== override.id) // Exclude current override in edit mode
                .map(ov => ov.rateItemId)
        );

        return currentRateCard.entries
            .filter(entry => !overriddenItemIds.has(entry.rateItemId)) // Filter out overridden items
            .map(entry => {
                const item = rateItems.find(ri => ri.id === entry.rateItemId);
                return {
                    id: entry.rateItemId,
                    name: item?.name || `Unknown (${entry.rateItemId})`,
                    unitType: item?.unitType || "Unknown"
                };
            });
    }, [currentRateCard, rateItems, existingOverrides, isEditMode, override]);

    const handleSave = () => {
        setAttempted(true);

        if (!selectedRateItemId || !reason) return;

        // Validation: At least one rate override must be provided
        if (costRate === undefined && clientRate === undefined) {
            return;
        }

        if (isEditMode) {
            // Update existing override
            updateMutation.mutate({
                ...override,
                costRate,
                clientRate,
                reason
            }, {
                onSuccess: () => {
                    onOpenChange(false);
                }
            });
        } else {
            // Add new override
            addMutation.mutate({
                projectId,
                rateItemId: selectedRateItemId,
                costRate,
                clientRate,
                reason
            }, {
                onSuccess: () => {
                    resetForm();
                    onOpenChange(false);
                }
            });
        }
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!override) return;

        deleteMutation.mutate({
            overrideId: override.id,
            projectId
        }, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                onOpenChange(false);
            }
        });
    };

    const isValid = !!selectedRateItemId && !!reason && (costRate !== undefined || clientRate !== undefined);
    const isPending = addMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
    const hasError = addMutation.isError || updateMutation.isError || deleteMutation.isError;
    const errorMessage = (addMutation.error as Error)?.message ||
        (updateMutation.error as Error)?.message ||
        (deleteMutation.error as Error)?.message ||
        "Please try again later.";

    // Format audit dates for edit mode
    const formattedDate = override ? new Date(override.createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : "";

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop className={styles.backdrop()}>
                <Modal.Container>
                    <Modal.Dialog className={styles.dialog()}>
                        <Surface className="w-full h-full bg-transparent flex flex-col overflow-hidden p-0">
                            <Modal.Header className={styles.header()}>
                                <div className="flex items-center gap-4 min-w-0 shrink-0 pr-8">
                                    <div className={styles.iconWrapper()}>
                                        <Icon icon={isEditMode ? "lucide:edit-3" : "lucide:plus"} className="size-5 shrink-0" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <Modal.Heading className="text-base font-bold text-foreground leading-tight truncate">
                                            {isEditMode ? "Edit Custom Rate" : "Add Custom Rate"}
                                        </Modal.Heading>
                                        <p className="text-xs text-default-500 font-medium line-clamp-2 leading-snug">
                                            {isEditMode
                                                ? "Modify project-specific rate adjustments"
                                                : "Create a custom rate for this project"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <Modal.CloseTrigger className={styles.closeButton()}>
                                    <Icon icon="lucide:x" className="w-5 h-5" />
                                </Modal.CloseTrigger>
                            </Modal.Header>

                            <Form className="flex flex-col flex-1 overflow-hidden" key={`${isOpen}-${override?.id || 'new'}`} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                <Modal.Body className={styles.body()}>
                                    <ScrollShadow className="h-full px-4 py-5 space-y-5 [scrollbar-gutter:stable]">
                                        {isLoading ? (
                                            <div className="space-y-4">
                                                <Skeleton className={`${SKELETON_FIELD_HEIGHT} w-full`} />
                                                <Skeleton className={`${SKELETON_AREA_HEIGHT} w-full`} />
                                                <Skeleton className={`${SKELETON_FIELD_HEIGHT} w-full`} />
                                            </div>
                                        ) : !currentRateCard ? (
                                            <Alert status="warning">
                                                <Alert.Indicator />
                                                <Alert.Content>
                                                    <Alert.Title>No Rate Card Selected</Alert.Title>
                                                    <Alert.Description>Please select a rate card for the project before adding custom rates.</Alert.Description>
                                                </Alert.Content>
                                            </Alert>
                                        ) : (
                                            <div className="space-y-4">
                                                {hasError && (
                                                    <Alert status="danger" className="rounded-xl">
                                                        <Alert.Indicator />
                                                        <Alert.Content>
                                                            <Alert.Title>Operation failed</Alert.Title>
                                                            <Alert.Description>{errorMessage}</Alert.Description>
                                                        </Alert.Content>
                                                    </Alert>
                                                )}

                                                {/* Contextual Help */}
                                                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                                                    <Icon icon="lucide:info" className="size-4 shrink-0 text-accent mt-0.5" />
                                                    <p className="text-xs text-default-600 leading-relaxed">
                                                        <strong className="font-semibold text-foreground">Custom Rates</strong> set permanent custom rates for this project (e.g., negotiated contract terms). They replace the base rate for all orders.
                                                    </p>
                                                </div>

                                                {/* Rate Item Selection (add mode) or Display (edit mode) */}
                                                {isEditMode ? (
                                                    <TextField isDisabled className="group">
                                                        <Label className={styles.label()}>Overriding Item</Label>
                                                        <InputGroup fullWidth>
                                                            <InputGroup.Input
                                                                value={selectedRateItem?.name || "Unknown Item"}
                                                                readOnly
                                                            />
                                                            <InputGroup.Suffix className="font-mono text-xs uppercase tracking-[0.15em]">
                                                                ID: {selectedRateItemId}
                                                            </InputGroup.Suffix>
                                                        </InputGroup>
                                                    </TextField>
                                                ) : (
                                                    <ComboBox
                                                        selectedKey={selectedRateItemId}
                                                        onSelectionChange={(key) => setSelectedRateItemId(key as string)}
                                                        isRequired
                                                        isInvalid={attempted && !selectedRateItemId}
                                                        className="group"
                                                    >
                                                        <Label className={styles.label()}>Rate Item</Label>
                                                        <ComboBox.InputGroup>
                                                            <Input placeholder="Search rate items..." />
                                                            <ComboBox.Trigger />
                                                        </ComboBox.InputGroup>
                                                        <ComboBox.Popover>
                                                            <ListBox>
                                                                {rateItemOptions.map(option => (
                                                                    <ListBox.Item key={option.id} id={option.id} textValue={option.name}>
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="font-medium text-sm">{option.name}</span>
                                                                            <span className="text-tiny text-default-400 uppercase tracking-wider">{option.unitType}</span>
                                                                        </div>
                                                                        <ListBox.ItemIndicator />
                                                                    </ListBox.Item>
                                                                ))}
                                                            </ListBox>
                                                        </ComboBox.Popover>
                                                        <FieldError>Please select a rate item to override</FieldError>
                                                    </ComboBox>
                                                )}

                                                {/* Base Rates Display with Rate Item Info */}
                                                {selectedBaseEntry && (
                                                    <Card>
                                                        <Card.Header>
                                                            <Card.Title>Base Rates</Card.Title>
                                                            <Card.Description>
                                                                {currentRateCard.name}
                                                                {selectedRateItem && ` (per ${selectedRateItem.unitType.toLowerCase()})`}
                                                            </Card.Description>
                                                        </Card.Header>
                                                        <Card.Content>
                                                            <div className="flex gap-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={styles.label()}>Expense</span>
                                                                    <CurrencyDisplay amount={selectedBaseEntry.costRate} currency={currency} size="sm" variant="soft" color="accent" />
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={styles.label()}>Revenue</span>
                                                                    <CurrencyDisplay amount={selectedBaseEntry.clientRate} currency={currency} size="sm" variant="soft" color="accent" />
                                                                </div>
                                                            </div>
                                                        </Card.Content>
                                                    </Card>
                                                )}

                                                <div className="flex flex-col gap-3">
                                                    <TextField
                                                        value={costRate !== undefined ? costRate.toFixed(2) : ""}
                                                        onChange={(value) => setCostRate(value ? parseFloat(value) : undefined)}
                                                        className="w-full group"
                                                        isInvalid={attempted && costRate === undefined && clientRate === undefined}
                                                        name="costOverride"
                                                    >
                                                        <Label className={styles.label()}>New Expense Rate</Label>
                                                        <InputGroup fullWidth>
                                                            <InputGroup.Prefix>{getCurrencySymbol(currency)}</InputGroup.Prefix>
                                                            <InputGroup.Input type="number" placeholder="0.00" step={CURRENCY_INPUT_STEP} min="0" />
                                                            <InputGroup.Suffix>{currency}</InputGroup.Suffix>
                                                        </InputGroup>
                                                        <Description>This project's internal cost</Description>
                                                    </TextField>
                                                    <TextField
                                                        value={clientRate !== undefined ? clientRate.toFixed(2) : ""}
                                                        onChange={(value) => setClientRate(value ? parseFloat(value) : undefined)}
                                                        className="w-full group"
                                                        isInvalid={attempted && costRate === undefined && clientRate === undefined}
                                                        name="clientOverride"
                                                    >
                                                        <Label className={styles.label()}>New Revenue Rate</Label>
                                                        <InputGroup fullWidth>
                                                            <InputGroup.Prefix>{getCurrencySymbol(currency)}</InputGroup.Prefix>
                                                            <InputGroup.Input type="number" placeholder="0.00" step={CURRENCY_INPUT_STEP} min="0" />
                                                            <InputGroup.Suffix>{currency}</InputGroup.Suffix>
                                                        </InputGroup>
                                                        <Description>This project's client rate</Description>
                                                        <FieldError>Please provide at least one rate</FieldError>
                                                    </TextField>
                                                </div>


                                                {/* Reason Field */}
                                                <TextField
                                                    isRequired
                                                    value={reason}
                                                    onChange={setReason}
                                                    maxLength={OVERRIDE_REASON_MAX_LENGTH}
                                                    isInvalid={attempted && !reason.trim()}
                                                    className="group"
                                                >
                                                    <Label className={styles.label()}>Reason for Custom Rate</Label>
                                                    <TextArea
                                                        placeholder="e.g., Special client discount, Competitive pricing match, Volume discount agreement..."
                                                        className="w-full"
                                                    />
                                                    <Description>
                                                        {reason.length}/{OVERRIDE_REASON_MAX_LENGTH} characters • Required for audit purposes.
                                                    </Description>
                                                    <FieldError>Please provide a reason for this override</FieldError>
                                                </TextField>

                                                {/* Audit Info (edit mode only) */}
                                                {isEditMode && override && (
                                                    <div className="flex items-center gap-2 py-3 pr-3 rounded-lg bg-default-50/30 text-sm text-default-500 border border-transparent">
                                                        <Icon icon="lucide:info" className="size-4 shrink-0" />
                                                        <span>Created on {formattedDate} by <strong className="font-semibold text-default-700">{override.createdBy}</strong></span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </ScrollShadow>
                                </Modal.Body>

                                <Modal.Footer className={styles.footer()}>
                                    {isEditMode && override && (
                                        <Button
                                            variant="danger"
                                            isIconOnly
                                            onPress={handleDelete}
                                            isDisabled={deleteMutation.isPending}
                                            aria-label="Remove override"
                                        >
                                            <Icon icon="lucide:trash-2" className="w-5 h-5" />
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        formNoValidate
                                        isDisabled={!isValid || isPending}
                                        variant="primary"
                                        className="flex-1"
                                        isPending={isPending}
                                    >
                                        {isEditMode ? "Save Changes" : "Add Custom Rate"}
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Surface>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>

            {/* Delete Confirmation Dialog */}
            <AlertDialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialog.Backdrop>
                    <AlertDialog.Container>
                        <AlertDialog.Dialog className="sm:max-w-[400px]">
                            <AlertDialog.CloseTrigger />
                            <AlertDialog.Header>
                                <AlertDialog.Icon status="warning" />
                                <AlertDialog.Heading>Delete this override?</AlertDialog.Heading>
                            </AlertDialog.Header>
                            <AlertDialog.Body>
                                <p className="text-sm text-default-600">
                                    This will permanently remove the override for <strong>{selectedRateItem?.name || 'this item'}</strong>.
                                    The base rate card values will apply to future billing.
                                </p>
                            </AlertDialog.Body>
                            <AlertDialog.Footer>
                                <Button slot="close" variant="tertiary">
                                    Cancel
                                </Button>
                                <Button
                                    slot="close"
                                    variant="danger"
                                    onPress={confirmDelete}
                                    isPending={deleteMutation.isPending}
                                >
                                    Delete Custom Rate
                                </Button>
                            </AlertDialog.Footer>
                        </AlertDialog.Dialog>
                    </AlertDialog.Container>
                </AlertDialog.Backdrop>
            </AlertDialog>
        </Modal >
    );
}
