import { Button, ScrollShadow, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CanvasBlock, BlockConfig } from "../../../../types/workflow";
import { BLOCK_LIBRARY, UI_CATEGORIES, CategoryMeta, BlockLibraryItem } from "../../../../data/block-ui-categories";
import { useMemo, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { BlockConfigForm } from "./BlockConfigForm";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import { DeleteBlockModal } from "./DeleteBlockModal";
import { getDependentBlocks } from "../../../../utils/workflow-dependencies";
import { START_NODE_ID } from "../constants";

export interface BlockSettingsRef {
    promptUnsavedChanges: (onConfirm: () => void) => boolean;
}

interface BlockSettingsPanelProps {
    block: CanvasBlock | null;
    availableBlocks: CanvasBlock[];
    onClose: () => void;
    onDelete: (blockId: string) => void;
    onSave: (config: BlockConfig) => void;
    onDirtyChange?: (isDirty: boolean) => void;
    onCancelPendingAction?: () => void;
    isLoading?: boolean;
}

/**
 * Internal component to handle local form state and reset on block change via key.
 */
function BlockSettingsContent({
    block,
    availableBlocks,
    onDirtyChange,
    onConfigUpdate
}: {
    block: CanvasBlock;
    availableBlocks: CanvasBlock[];
    onDirtyChange: (isDirty: boolean) => void;
    onConfigUpdate: (config: BlockConfig | undefined) => void;
}) {
    const [localConfig, setLocalConfig] = useState<BlockConfig | undefined>(block.config);

    const handleUpdate = (cfg: BlockConfig) => {
        setLocalConfig(cfg);
        onDirtyChange(true);
        onConfigUpdate(cfg);
    };

    return (
        <BlockConfigForm
            block={{
                ...block,
                config: localConfig
            }}
            availableBlocks={availableBlocks}
            onUpdate={handleUpdate}
        />
    );
}

/**
 * Right panel for block configuration.
 * Slides in when a block is selected.
 */
export const BlockSettingsPanel = forwardRef<BlockSettingsRef, BlockSettingsPanelProps>(({
    block,
    availableBlocks,
    onClose,
    onDelete,
    onSave,
    onDirtyChange,
    onCancelPendingAction,
    isLoading = false
}, ref) => {
    const [hasChanges, setHasChanges] = useState(false);
    const [localConfig, setLocalConfig] = useState<BlockConfig | undefined>(undefined);
    const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Sync local states when block changes
    const blockId = block?.id;
    const blockConfig = block?.config;

    useEffect(() => {
        setLocalConfig(blockConfig);
        setHasChanges(false);
        onDirtyChange?.(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockId]); // Only reset when block ID changes

    const isOpen = !!block;

    useImperativeHandle(ref, () => ({
        promptUnsavedChanges: (onConfirm: () => void) => {
            if (hasChanges) {
                setPendingAction(() => onConfirm);
                setIsUnsavedModalOpen(true);
                return true;
            }
            return false;
        }
    }), [hasChanges]);

    const blockInfo = useMemo(() => {
        if (!block) return null;
        return BLOCK_LIBRARY.find((b: BlockLibraryItem) => b.type === block.type);
    }, [block]);

    const categoryInfo = useMemo(() => {
        if (!blockInfo) return null;
        return UI_CATEGORIES.find((c: CategoryMeta) => c.id === blockInfo.category);
    }, [blockInfo]);

    const dependentBlocks = useMemo(() => {
        if (!block) return [];
        return getDependentBlocks(block.id, availableBlocks);
    }, [block, availableBlocks]);

    const handleDirtyChange = (isDirty: boolean) => {
        setHasChanges(isDirty);
        onDirtyChange?.(isDirty);
    };

    const handleCloseTrigger = () => {
        if (hasChanges) {
            setPendingAction(() => onClose);
            setIsUnsavedModalOpen(true);
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        if (block) {
            if (localConfig) {
                onSave(localConfig);
            }

            setHasChanges(false);
            onDirtyChange?.(false);
            setIsUnsavedModalOpen(false);

            if (pendingAction) {
                pendingAction();
                setPendingAction(null);
            }
        }
    };

    const handleDiscard = () => {
        setHasChanges(false);
        onDirtyChange?.(false);
        setIsUnsavedModalOpen(false);

        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        } else {
            onClose();
        }
    };

    const handleModalCancel = () => {
        setIsUnsavedModalOpen(false);
        setPendingAction(null);
        onCancelPendingAction?.();
    };

    const handleDeleteTrigger = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (block) {
            onDelete(block.id);
            setHasChanges(false);
            onDirtyChange?.(false);
        }
    };

    return (
        <>
            <aside
                className={`flex h-full flex-col bg-surface shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
                    }`}
                id="block-settings-panel"
                aria-label="Block settings panel"
            >
                <div className="flex h-full w-[320px] flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-default-100 p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{ backgroundColor: categoryInfo?.color + '20' }}
                            >
                                <Icon
                                    icon={blockInfo?.icon || 'lucide:box'}
                                    className="h-6 w-6"
                                    style={{ color: categoryInfo?.color }}
                                />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">
                                    {block?.label || 'No Block Selected'}
                                </h3>
                                {categoryInfo && (
                                    <p className="text-xs font-medium uppercase tracking-wider text-default-500">
                                        {categoryInfo.label}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            isIconOnly
                            variant="ghost"
                            onPress={handleCloseTrigger}
                            aria-label="Close settings"
                        >
                            <Icon icon="lucide:x" className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content Area */}
                    <ScrollShadow className="flex-grow p-4">
                        {isLoading ? (
                            <div className="flex h-40 flex-col items-center justify-center gap-3">
                                <Spinner size="lg" />
                                <p className="text-xs font-medium text-default-500">Loading configuration...</p>
                            </div>
                        ) : block ? (
                            <BlockSettingsContent
                                key={block.id}
                                block={block}
                                availableBlocks={availableBlocks}
                                onDirtyChange={handleDirtyChange}
                                onConfigUpdate={setLocalConfig}
                            />
                        ) : (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                                <Icon icon="lucide:mouse-pointer-click" className="h-8 w-8 text-default-300" />
                                <p className="text-sm text-default-400">Select a block to configure its settings</p>
                            </div>
                        )}
                    </ScrollShadow>

                    {/* Footer */}
                    <div className="flex flex-col gap-3 border-t border-default-100 p-4">
                        <Button
                            variant="primary"
                            className="w-full font-semibold"
                            onPress={handleSave}
                            isDisabled={!hasChanges}
                        >
                            Save Changes
                        </Button>
                        <Button
                            variant="danger-soft"
                            className="w-full text-xs"
                            onPress={handleDeleteTrigger}
                            isDisabled={block?.id === START_NODE_ID}
                        >
                            <Icon icon="lucide:trash-2" className="h-4 w-4 mr-2" />
                            Delete Block
                        </Button>
                    </div>
                </div>
            </aside>

            <UnsavedChangesModal
                isOpen={isUnsavedModalOpen}
                onClose={handleModalCancel}
                onDiscard={handleDiscard}
                onSave={handleSave}
            />

            <DeleteBlockModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                blockLabel={block?.label || ""}
                dependentBlocks={dependentBlocks}
            />


        </>
    );
});

BlockSettingsPanel.displayName = 'BlockSettingsPanel';
