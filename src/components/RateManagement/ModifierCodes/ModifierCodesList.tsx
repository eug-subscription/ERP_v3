import { Icon } from "@iconify/react";
import {
    Button,
    Skeleton,
    Alert,
    AlertDialog,
    Switch,
    Tooltip,
    Chip
} from "@heroui/react";
import { useModifierReasonCodes } from "../../../hooks/useModifierReasonCodes";
import { EmptyState } from "../../pricing/EmptyState";
import { useState, useMemo } from "react";
import { ModifierReasonCode } from "../../../types/pricing";
import { DEFAULT_SKELETON_COUNT, METADATA_CLASSES, PRICING_ITEM_TRACKING } from "../../../constants/pricing";
import { Table } from "../../pricing/Table";
import { FilterBar } from "../../pricing/FilterBar";
import { DENSITY_CONTROL_HEIGHT, TOOLTIP_DELAY, COPY_FEEDBACK_DURATION_MS } from "../../../constants/ui-tokens";

interface ModifierCodesListProps {
    onEdit?: (code: ModifierReasonCode) => void;
    onAdd?: () => void;
    onToggleActive?: (code: ModifierReasonCode, active: boolean) => void;
    onArchive?: (code: ModifierReasonCode) => void;
}

/**
 * OptimisticToggle - Internal component to handle immediate UI feedback for status switches.
 * Prevents the "stuck" feeling caused by the 1s mock API delay.
 */
function OptimisticToggle({
    code,
    onToggle
}: {
    code: ModifierReasonCode;
    onToggle?: (code: ModifierReasonCode, active: boolean) => void;
}) {
    const handleToggle = (isSelected: boolean) => {
        onToggle?.(code, isSelected);
    };

    return (
        <Switch
            size="sm"
            isSelected={code.active}
            onChange={handleToggle}
            aria-label={`Toggle status for ${code.displayName}`}
        >
            <Switch.Control>
                <Switch.Thumb />
            </Switch.Control>
        </Switch>
    );
}

/**
 * CopyableCode - Internal component to handle inline success micro-interactions for copying.
 * Morphing icon and color shift replace "loud" toast notifications.
 */
function CopyableCode({ code }: { code: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), COPY_FEEDBACK_DURATION_MS);
    };

    return (
        <Tooltip delay={TOOLTIP_DELAY}>
            <Tooltip.Trigger>
                <Button
                    variant="tertiary"
                    size="sm"
                    className={`transition-all border min-w-0 flex items-center gap-2 rounded-md ${DENSITY_CONTROL_HEIGHT} ${isCopied
                        ? "bg-success/5 border-success/20 text-success"
                        : "bg-default-100/30 hover:bg-default-100/50 border-default-200/50 text-default-600"
                        } ${METADATA_CLASSES}`}
                    onPress={handleCopy}
                >
                    <span>{code}</span>
                    <Icon
                        icon={isCopied ? "lucide:check" : "lucide:copy"}
                        className={`w-3 h-3 transition-transform ${isCopied ? "scale-110" : "opacity-40"}`}
                    />
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content offset={8}>
                {isCopied ? "Copied!" : "Click to copy"}
            </Tooltip.Content>
        </Tooltip >
    );
}

/**
 * ModifierCodesList - Displays and manages global modifier reason codes.
 * Used for tagging rush delivery, discounts, etc.
 */
export function ModifierCodesList({ onEdit, onAdd, onToggleActive, onArchive }: ModifierCodesListProps) {
    // Fetch both active and inactive codes for the management view
    const { data: reasonCodes, isLoading, error, refetch } = useModifierReasonCodes(false);

    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCodes = useMemo(() => {
        if (!reasonCodes) return [];

        let result = [...reasonCodes];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.code.toLowerCase().includes(query) ||
                c.displayName.toLowerCase().includes(query)
            );
        }

        // Status Filter - Simplified 3-tier lifecycle
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') result = result.filter(c => c.active === true && c.status === 'active');
            else if (statusFilter === 'inactive') result = result.filter(c => c.active === false && c.status === 'active');
            else if (statusFilter === 'archived') result = result.filter(c => c.status === 'archived');
        } else {
            // Default 'all' view excludes archived codes to avoid clutter
            result = result.filter(c => c.status !== 'archived');
        }

        return result;
    }, [reasonCodes, searchQuery, statusFilter]);


    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                {Array.from({ length: DEFAULT_SKELETON_COUNT }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Alert status="danger" className="rounded-2xl">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Title className="font-bold">Error Loading Reason Codes</Alert.Title>
                    <Alert.Description>Could not retrieve the modifier reason code catalogue.</Alert.Description>
                    <Button
                        size="sm"
                        variant="danger-soft"
                        onPress={() => refetch()}
                        className="font-bold mt-2"
                    >
                        Retry
                    </Button>
                </Alert.Content>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <FilterBar
                    search={{
                        value: searchQuery,
                        onChange: setSearchQuery,
                        placeholder: "Search by code or name..."
                    }}
                    status={{
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { key: 'all', label: 'All' },
                            { key: 'active', label: 'Active' },
                            { key: 'inactive', label: 'Inactive' },
                            { key: 'archived', label: 'Archived' }
                        ]
                    }}
                />
            </div>

            {/* Custom Table */}
            <Table>
                <Table.Header>
                    <tr>
                        <Table.Column isBlack>Internal Code</Table.Column>
                        <Table.Column>Display Name</Table.Column>
                        <Table.Column align="center">Usage</Table.Column>
                        <Table.Column align="center">Active</Table.Column>
                        <Table.Column align="right">Actions</Table.Column>
                    </tr>
                </Table.Header>
                <Table.Body>
                    {filteredCodes.length > 0 ? (
                        filteredCodes.map((code) => (
                            <Table.Row key={code.id}>
                                <Table.Cell>
                                    <CopyableCode code={code.code} />
                                </Table.Cell>
                                <Table.Cell>
                                    <span className={`font-bold t-compact text-foreground ${PRICING_ITEM_TRACKING}`}>{code.displayName}</span>
                                </Table.Cell>
                                <Table.Cell align="center">
                                    {code.usageCount !== undefined && code.usageCount > 0 ? (
                                        <Chip
                                            variant="soft"
                                            size="sm"
                                            color={code.usageCount >= 50 ? "accent" : "default"}
                                            className={`font-medium ${METADATA_CLASSES} h-6 px-2`}
                                        >
                                            {code.usageCount >= 50 && <Icon icon="lucide:activity" width={12} className="mr-1" />}
                                            {code.usageCount}
                                        </Chip>
                                    ) : (
                                        <span className="text-xs text-default-400 italic">Not used</span>
                                    )}
                                </Table.Cell>
                                <Table.Cell align="center">
                                    <div className="flex justify-center">
                                        <OptimisticToggle
                                            code={code}
                                            onToggle={onToggleActive}
                                        />
                                    </div>
                                </Table.Cell>
                                <Table.Cell align="right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-full bg-default-100/50 text-accent transition-all hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                                    onPress={() => onEdit?.(code)}
                                                    aria-label={`Edit ${code.displayName}`}
                                                >
                                                    <Icon icon="lucide:edit-3" width={16} />
                                                </Button>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>Edit Code</Tooltip.Content>
                                        </Tooltip>

                                        <Tooltip delay={TOOLTIP_DELAY}>
                                            <Tooltip.Trigger>
                                                <AlertDialog>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="ghost"
                                                        className="rounded-full bg-default-100/50 text-warning transition-all hover:bg-warning/10 border border-transparent hover:border-warning/20"
                                                        aria-label={`Archive ${code.displayName}`}
                                                    >
                                                        <Icon icon="lucide:archive" width={16} />
                                                    </Button>
                                                    <AlertDialog.Backdrop className="backdrop-blur-sm bg-black/20">
                                                        <AlertDialog.Container>
                                                            <AlertDialog.Dialog className="max-w-md">
                                                                <AlertDialog.CloseTrigger />
                                                                <AlertDialog.Header>
                                                                    <AlertDialog.Icon status="warning" />
                                                                    <AlertDialog.Heading>
                                                                        Archive Reason Code?
                                                                    </AlertDialog.Heading>
                                                                </AlertDialog.Header>
                                                                <AlertDialog.Body>
                                                                    <p>
                                                                        Are you sure you want to archive the reason code <span className="font-bold text-foreground">"{code.displayName}"</span> ({code.code})?
                                                                        {code.usageCount && code.usageCount > 0 ? (
                                                                            <>
                                                                                {' '}This code is currently <span className="font-bold text-warning">used in {code.usageCount} {code.usageCount === 1 ? 'order' : 'orders'}</span>.
                                                                            </>
                                                                        ) : null}
                                                                        {' '}It will be hidden from active lists but preserved for historical accuracy.
                                                                    </p>
                                                                </AlertDialog.Body>
                                                                <AlertDialog.Footer>
                                                                    <Button
                                                                        slot="close"
                                                                        variant="tertiary"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        slot="close"
                                                                        variant="danger"
                                                                        onPress={() => onArchive?.(code)}
                                                                    >
                                                                        Archive Code
                                                                    </Button>
                                                                </AlertDialog.Footer>
                                                            </AlertDialog.Dialog>
                                                        </AlertDialog.Container>
                                                    </AlertDialog.Backdrop>
                                                </AlertDialog>
                                            </Tooltip.Trigger>
                                            <Tooltip.Content>Archive Code</Tooltip.Content>
                                        </Tooltip>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-0">
                                <EmptyState
                                    icon="lucide:ticket-percent"
                                    title="No Reason Codes"
                                    description={searchQuery
                                        ? `We couldn't find any reason codes matching "${searchQuery}".`
                                        : "Modifier reason codes allow you to track discounts, rush fees, and other price adjustments. Start your catalog now."
                                    }
                                    actionLabel={searchQuery ? "Clear Search" : "New Reason Code"}
                                    onAction={searchQuery ? () => setSearchQuery("") : onAdd}
                                />
                            </td>
                        </tr>
                    )}
                </Table.Body>
            </Table>
        </div>
    );
}
