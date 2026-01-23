import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    CollisionDetection
} from "@dnd-kit/core";
import { BlockLibrary } from "./BlockLibrary/BlockLibrary";
import { BlockLibraryItem } from "../../../data/block-ui-categories";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { WorkflowCanvas } from "./WorkflowCanvas/WorkflowCanvas";
import { useWorkflowBuilder } from "../../../hooks/useWorkflowBuilder";
import { useProjectWorkflow } from "../../../hooks/useProjectWorkflow";
import { CanvasBlockCard } from "./WorkflowCanvas/CanvasBlockCard";
import type { CanvasBlock as CanvasBlockType } from "../../../types/workflow";
import { CANVAS_BLOCK_WIDTH, PLACEHOLDER_PREFIX } from "./constants";
import { BlockSettingsPanel, BlockSettingsRef } from "./BlockSettings/BlockSettingsPanel";
import { Button, Chip, Modal, Alert, Tooltip } from "@heroui/react";
import { SaveNamingModal } from "./SaveNamingModal";
import { useResponsive } from "../../../hooks/useMediaQuery";

type ActiveDragState =
    | { kind: 'LIBRARY', item: BlockLibraryItem }
    | { kind: 'CANVAS', item: CanvasBlockType }
    | null;


/**
 * Main Workflow Builder container.
 * Orchestrates drag-and-drop between Library and Canvas, and manages global workflow state.
 */
export function WorkflowBuilder({ projectId = 'current-project' }: { projectId?: string }) {
    const { data: initialWorkflow, isLoading: isWorkflowLoading } = useProjectWorkflow(projectId);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const [activeDragState, setActiveDragState] = useState<ActiveDragState>(null);
    const { state, actions, validation, isSaving } = useWorkflowBuilder(initialWorkflow || undefined);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showNamingModal, setShowNamingModal] = useState(false);
    const [isPreviewingFixes, setIsPreviewingFixes] = useState(false);

    // Default naming logic: "Custom Workflow 1"
    const [workflowName, setWorkflowName] = useState('Custom Workflow 1');
    const settingsRef = useRef<BlockSettingsRef>(null);

    // Responsive and UI State
    const { isDesktop } = useResponsive();
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);

    // Sync library state with desktop breakpoint
    useEffect(() => {
        setIsLibraryOpen(isDesktop);
    }, [isDesktop]);


    // Check if currently dragging a Merge block
    const isDraggingMergeBlock = activeDragState?.kind === 'LIBRARY' && activeDragState.item.type === 'MERGE';

    // Get IDs of blocks in photo/video branches for filtering
    const laneBlockIds = useMemo(() => new Set(
        state.blocks
            .filter(b => b.position.branchId === 'photo' || b.position.branchId === 'video')
            .map(b => b.id)
    ), [state.blocks]);

    // Use custom collision detection when dragging Merge block
    const collisionDetection: CollisionDetection = useCallback((args) => {
        const { droppableContainers, ...rest } = args;

        let filteredContainers = droppableContainers;
        if (isDraggingMergeBlock) {
            filteredContainers = droppableContainers.filter((container) => {
                const id = container.id.toString();
                if (id.includes('photo-drop-zone') || id.includes('video-drop-zone')) {
                    return false;
                }
                if (laneBlockIds.has(id)) {
                    return false;
                }
                return true;
            });
        }

        return closestCorners({ ...rest, droppableContainers: filteredContainers });
    }, [isDraggingMergeBlock, laneBlockIds]);

    const [isSettingsDirty, setIsSettingsDirty] = useState(false);

    const handleBlockSelect = useCallback((id: string | null) => {
        if (isSettingsDirty && settingsRef.current) {
            settingsRef.current.promptUnsavedChanges(() => actions.selectBlock(id));
        } else {
            actions.selectBlock(id);
        }
    }, [isSettingsDirty, actions]);

    // Global keyboard listener for shortcuts (Delete, Escape)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const selectedId = state.canvasState.selectedBlockId;

            // Don't trigger if user is typing in an input
            if (
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (selectedId) {
                // Delete selected block
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    actions.removeBlock(selectedId);
                }

                // Deselect / Close panel
                if (e.key === 'Escape') {
                    handleBlockSelect(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.canvasState.selectedBlockId, actions, handleBlockSelect]);

    const [projectionIndex, setProjectionIndex] = useState<number | null>(null);
    const [projectionBranchId, setProjectionBranchId] = useState<'main' | 'photo' | 'video'>('main');
    const [dragError, setDragError] = useState<string | null>(null);

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            if (projectionIndex !== null) setProjectionIndex(null);
            if (dragError !== null) setDragError(null);
            return;
        }

        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";
        const overData = over.data.current;

        let branchId: 'main' | 'photo' | 'video' = 'main';
        if (overData?.branchId) {
            branchId = overData.branchId;
        } else {
            const overBlock = state.blocks.find(b => b.id === over.id);
            if (overBlock) branchId = overBlock.position.branchId;
        }

        let nextError: string | null = null;
        let nextIndex = state.blocks.length;

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType) {
                if (over.id === `${PLACEHOLDER_PREFIX}${blockType}`) return;

                if (!validation.isBlockAllowedInBranch(blockType, branchId)) {
                    const laneName = branchId === 'photo' ? 'Photo' : branchId === 'video' ? 'Video' : 'Main';
                    nextError = `This block cannot be placed in the ${laneName} lane`;
                    nextIndex = -1;
                }
            }
        } else {
            const activeBlock = state.blocks.find(b => b.id === active.id);
            if (activeBlock && activeBlock.position.branchId !== branchId) {
                nextError = "Cross-lane drag is not allowed";
                nextIndex = -1;
                branchId = activeBlock.position.branchId;
            }
        }

        if (nextIndex !== -1) {
            if (overData?.type === "DROP_ZONE") {
                nextIndex = (overData.index as number) ?? (overData.branchIndex as number) ?? state.blocks.length;
            } else if (over.id === 'drop-zone-root' || over.id === 'drop-zone-1') {
                nextIndex = 1;
            } else if (typeof over.id === 'string' && over.id.includes('drop-zone-')) {
                const parsedIndex = parseInt(over.id.split('-').pop() || '', 10);
                if (!isNaN(parsedIndex)) nextIndex = parsedIndex;
            } else {
                const overIndex = state.blocks.findIndex(b => b.id === over.id);
                if (overIndex !== -1) nextIndex = overIndex + 1;
            }
        }

        if (dragError !== nextError) setDragError(nextError);
        if (projectionBranchId !== branchId) setProjectionBranchId(branchId);
        if (projectionIndex !== (nextIndex === -1 ? null : nextIndex)) setProjectionIndex(nextIndex === -1 ? null : nextIndex);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const current = active.data.current;

        if (current?.type === "BLOCK_TEMPLATE") {
            setActiveDragState({
                kind: 'LIBRARY',
                item: {
                    type: current.blockType,
                    category: current.category,
                    label: current.label || "New Block",
                    description: "",
                    icon: current.icon || "lucide:box",
                } as BlockLibraryItem
            });
            return;
        }

        const canvasBlock = state.blocks.find(b => b.id === active.id);
        if (canvasBlock) {
            setActiveDragState({
                kind: 'CANVAS',
                item: canvasBlock
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const finalBranchId = projectionBranchId;
        const finalIndex = projectionIndex;

        setActiveDragState(null);
        setDragError(null);
        setProjectionIndex(null);

        if (!over) return;

        const isNewBlock = active.data.current?.type === "BLOCK_TEMPLATE";

        if (isNewBlock) {
            const blockType = active.data.current?.blockType;
            if (blockType && finalIndex !== null) {
                if (validation.isBlockAllowedInBranch(blockType, finalBranchId)) {
                    actions.insertBlock(blockType, finalIndex, finalBranchId);
                }
            }
            return;
        }

        if (active.id !== over.id && !over.id.toString().startsWith('drop-zone-')) {
            actions.reorderBlocks(active.id as string, over.id as string);
        }
    };


    const handleSave = () => {
        setShowNamingModal(true);
    };

    const handleConfirmName = async (name: string) => {
        setWorkflowName(name);
        setShowNamingModal(false);

        const result = validation.validate();
        if (!result.isValid || result.errors.length > 0) {
            setShowSaveModal(true);
        } else {
            // In a real app, we'd pass the name to the save action
            await actions.saveWorkflow();
        }
    };

    const errorCount = state.blocks.filter(b => b.validationState === 'error').length;
    const warningCount = state.blocks.filter(b => b.validationState === 'warning').length;

    // Memoize validation state to prevent excessive re-renders
    const validationResult = useMemo(() => validation.validate(), [validation]);
    const hasErrors = validationResult.errors.some(e => e.level === 'ERROR');

    return (
        <div className="flex flex-col min-h-[calc(100vh-350px)] h-full gap-4">
            {/* Header Section */}
            <div className="flex items-center justify-between px-2 pt-1 mb-2">
                <div className="flex items-center gap-3">
                    {!isDesktop && (
                        <Button
                            isIconOnly
                            variant="ghost"
                            onPress={() => setIsLibraryOpen(!isLibraryOpen)}
                            className="rounded-xl flex xl:hidden"
                            aria-label="Toggle Library"
                        >
                            <Icon icon={isLibraryOpen ? "lucide:menu-fold" : "lucide:menu-unfold"} width={20} />
                        </Button>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight">Workflow Builder</h2>
                        <p className="text-xs text-muted font-medium">Design and validate your automation sequence</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {errorCount > 0 && (
                        <Tooltip delay={0} closeDelay={100}>
                            <Tooltip.Trigger>
                                <Chip
                                    color="danger"
                                    variant="primary"
                                    className="h-7 px-3 rounded-xl animate-in fade-in slide-in-from-right-4 cursor-help"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="lucide:alert-circle" width={14} className="animate-pulse" />
                                        <span className="text-xs font-bold">{errorCount} {errorCount === 1 ? 'Error' : 'Errors'}</span>
                                    </div>
                                </Chip>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="max-w-xs p-4 bg-white text-foreground rounded-2xl shadow-premium border border-default-100">
                                <Tooltip.Arrow className="fill-white" />
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon icon="lucide:alert-circle" className="text-danger" width={16} />
                                        <p className="font-bold text-sm text-foreground">Validation Errors</p>
                                    </div>
                                    {validationResult.errors
                                        .filter(e => e.level === 'ERROR')
                                        .map((err, idx) => (
                                            <p key={idx} className="text-xs leading-relaxed text-default-600 pl-6 relative">
                                                <span className="absolute left-1 top-1.5 w-1 h-1 rounded-full bg-danger/40" />
                                                {err.message}
                                            </p>
                                        ))}
                                </div>
                            </Tooltip.Content>
                        </Tooltip>
                    )}
                    {warningCount > 0 && (
                        <Tooltip delay={0} closeDelay={100}>
                            <Tooltip.Trigger>
                                <Chip
                                    color="warning"
                                    variant="soft"
                                    className="h-7 px-3 rounded-xl animate-in fade-in slide-in-from-right-4 cursor-help"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <Icon icon="lucide:alert-triangle" width={14} />
                                        <span className="text-xs font-bold">{warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}</span>
                                    </div>
                                </Chip>
                            </Tooltip.Trigger>
                            <Tooltip.Content className="max-w-xs p-4 bg-white text-foreground rounded-2xl shadow-premium border border-default-100">
                                <Tooltip.Arrow className="fill-white" />
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon icon="lucide:alert-triangle" className="text-warning" width={16} />
                                        <p className="font-bold text-sm text-foreground">Warnings</p>
                                    </div>
                                    {validationResult.errors
                                        .filter(e => e.level === 'WARNING')
                                        .map((err, idx) => (
                                            <p key={idx} className="text-xs leading-relaxed text-default-600 pl-6 relative">
                                                <span className="absolute left-1 top-1.5 w-1 h-1 rounded-full bg-warning/40" />
                                                {err.message}
                                            </p>
                                        ))}
                                </div>
                            </Tooltip.Content>
                        </Tooltip>
                    )}

                    <Button
                        variant="primary"
                        className="rounded-2xl h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onPress={handleSave}
                        isPending={isSaving}
                        isDisabled={isSaving || isWorkflowLoading}
                    >
                        <Icon icon="lucide:save" width={18} className="mr-2" />
                        Save Workflow
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-1 overflow-hidden rounded-2xl border border-default-200 bg-background shadow-premium-sm relative">

                    {/* Block Library - Sidebar (Desktop) or Drawer (Tablet) */}
                    <div className={`${isDesktop ? 'relative' : 'fixed inset-0 z-50 pointer-events-none transition-all duration-300'}`}>
                        {/* Tablet/Mobile Backdrop */}
                        {!isDesktop && (
                            <div
                                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isLibraryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                onClick={() => setIsLibraryOpen(false)}
                            />
                        )}
                        <div
                            className={`transform transition-all duration-300 ease-in-out h-full pointer-events-auto bg-background ${isDesktop ? 'relative' : 'absolute inset-y-0 left-0 shadow-2xl'} ${isLibraryOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0 opacity-0 overflow-hidden'}`}
                        >
                            <BlockLibrary />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 relative">
                        <WorkflowCanvas
                            blocks={state.blocks}
                            onBlockSelect={handleBlockSelect}
                            selectedBlockId={state.canvasState.selectedBlockId}
                            lastAddedBlockId={state.canvasState.lastAddedBlockId}
                            activeLibraryItem={activeDragState?.kind === 'LIBRARY' ? activeDragState.item : null}
                            projectionIndex={projectionIndex}
                            projectionBranchId={projectionBranchId}
                            isLoading={isWorkflowLoading}
                        />
                    </div>

                    <div className={`${isDesktop ? 'relative' : 'fixed inset-0 z-40 pointer-events-none transition-all duration-300'}`}>
                        {/* Tablet/Mobile Backdrop for Settings */}
                        {!isDesktop && state.canvasState.selectedBlockId && (
                            <div
                                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto opacity-100"
                                onClick={() => actions.selectBlock(null)}
                            />
                        )}
                        <div className={`transition-all duration-300 ease-in-out h-full pointer-events-auto ${!isDesktop && state.canvasState.selectedBlockId ? 'absolute inset-y-0 right-0 z-50 shadow-2xl border-l border-default-200' : 'relative'}`}>
                            <BlockSettingsPanel
                                ref={settingsRef}
                                block={state.blocks.find(b => b.id === state.canvasState.selectedBlockId) || null}
                                availableBlocks={state.blocks}
                                onClose={() => actions.selectBlock(null)}
                                onDelete={(id) => {
                                    actions.removeBlock(id);
                                    setIsSettingsDirty(false);
                                }}
                                onSave={(config) => {
                                    const selectedId = state.canvasState.selectedBlockId;
                                    if (selectedId) {
                                        actions.updateBlockConfig(selectedId, config);
                                        setIsSettingsDirty(false);
                                    }
                                }}
                                onDirtyChange={setIsSettingsDirty}
                                isLoading={isWorkflowLoading}
                            />
                        </div>
                    </div>
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeDragState?.kind === 'LIBRARY' ? (
                        <div className="relative group">
                            <div className={`opacity-90 rotate-2 cursor-grabbing transition-opacity duration-200 ${dragError ? 'opacity-40 grayscale-[0.5]' : ''}`} style={{ width: CANVAS_BLOCK_WIDTH }}>
                                <CanvasBlockCard
                                    block={{
                                        id: 'temp-drag-preview',
                                        type: activeDragState.item.type,
                                        label: activeDragState.item.label,
                                        category: 'PROCESSING',
                                        isEnabled: true,
                                        position: { id: 'temp', branchId: 'main', index: 0 },
                                        validationState: 'valid'
                                    }}
                                    isSelected={true}
                                    className={`shadow-xl ${dragError ? 'border-danger-400' : ''}`}
                                />
                            </div>

                            {dragError && (
                                <div
                                    className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-2xl min-w-[220px] animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 z-[100] bg-danger text-white"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon icon="lucide:alert-circle" className="shrink-0" width={20} height={20} />
                                        <span className="text-sm font-semibold leading-tight">{dragError}</span>
                                    </div>
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-danger" />
                                </div>
                            )}
                        </div>
                    ) : null}

                    {activeDragState?.kind === 'CANVAS' ? (
                        <div className={`opacity-90 rotate-2 cursor-grabbing transition-opacity duration-200 ${dragError ? 'opacity-40 grayscale-[0.5]' : ''}`} style={{ width: CANVAS_BLOCK_WIDTH }}>
                            <CanvasBlockCard
                                block={activeDragState.item}
                                isSelected={true}
                                className={`shadow-xl ${dragError ? 'border-danger-400' : ''}`}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modal MUST use Backdrop -> Container -> Dialog nesting per docs and common portaling patterns */}
            <Modal
                isOpen={showSaveModal}
                onOpenChange={(open) => {
                    setShowSaveModal(open);
                    if (!open) setIsPreviewingFixes(false); // Reset on close
                }}
            >
                <Modal.Backdrop className="backdrop-blur-md bg-black/40">
                    <Modal.Container>
                        <Modal.Dialog className="max-w-lg bg-background border border-separator shadow-2xl rounded-3xl overflow-hidden">
                            <Modal.CloseTrigger />

                            <Modal.Header className="flex flex-col items-center pt-8 pb-4 px-8">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isPreviewingFixes ? 'bg-primary/10 text-primary' : (hasErrors ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning')}`}>
                                    <Icon icon={isPreviewingFixes ? "lucide:sparkles" : (hasErrors ? "lucide:alert-circle" : "lucide:alert-triangle")} className="w-8 h-8" />
                                </div>
                                <Modal.Heading className="text-2xl font-bold text-center">
                                    {isPreviewingFixes ? "Auto-Fix Preview" : "Workflow Issues Found"}
                                </Modal.Heading>
                                <p className="text-sm text-muted-foreground text-center mt-2 px-4">
                                    {isPreviewingFixes
                                        ? "The following changes will be applied to resolve the identified validation issues."
                                        : (hasErrors
                                            ? "Critical issues were found that must be resolved before saving."
                                            : "A few recommendations were found before saving."
                                        )
                                    }
                                </p>
                            </Modal.Header>

                            <Modal.Body className="px-8 py-4 space-y-4 max-h-[40vh] overflow-auto">
                                {!isPreviewingFixes ? (
                                    validationResult.errors.map((error, idx) => (
                                        <Alert
                                            key={`${error.type}-${idx}`}
                                            status={error.level === 'ERROR' ? 'danger' : 'warning'}
                                            className="rounded-2xl"
                                        >
                                            <Alert.Indicator />
                                            <Alert.Content>
                                                <Alert.Title className="text-sm font-semibold">
                                                    {error.message}
                                                </Alert.Title>
                                                {error.suggestion && (
                                                    <Alert.Description className="text-xs opacity-80 italic">
                                                        Suggestion: {error.suggestion}
                                                    </Alert.Description>
                                                )}
                                            </Alert.Content>
                                        </Alert>
                                    ))
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">Planned Changes</p>
                                        {validation.getAutoFixActions().map((action, idx) => (
                                            <Alert
                                                key={`${action.blockType}-${idx}`}
                                                status="default"
                                                className="rounded-2xl border-primary/20 bg-primary/5"
                                            >
                                                <div className="flex items-center">
                                                    <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-primary mr-3 shrink-0" />
                                                    <Alert.Content>
                                                        <Alert.Title className="text-sm font-semibold text-primary">
                                                            {action.reason}
                                                        </Alert.Title>
                                                    </Alert.Content>
                                                </div>
                                            </Alert>
                                        ))}
                                        {validation.getAutoFixActions().length === 0 && (
                                            <p className="text-sm text-center py-4 text-muted-foreground italic">No automatic fixes available for these issues.</p>
                                        )}
                                    </div>
                                )}
                            </Modal.Body>

                            <Modal.Footer className="border-t border-separator/20 p-6 rounded-b-3xl gap-3 flex flex-col sm:flex-row bg-default-50/50">
                                {!isPreviewingFixes ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onPress={() => setIsPreviewingFixes(true)}
                                            className="flex-1 rounded-xl font-semibold"
                                            isDisabled={validation.getAutoFixActions().length === 0}
                                        >
                                            <Icon icon="lucide:sparkles" className="w-4 h-4 mr-2" />
                                            Fix Automatically
                                        </Button>
                                        <div className="flex gap-2 flex-1">
                                            <Button
                                                variant="ghost"
                                                onPress={() => setShowSaveModal(false)}
                                                className="flex-1 rounded-xl"
                                            >
                                                Review
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onPress={async () => {
                                                    setShowSaveModal(false);
                                                    await actions.saveWorkflow();
                                                }}
                                                className="flex-1 rounded-xl shadow-lg shadow-accent/20 font-bold"
                                                isDisabled={!validationResult.isValid}
                                            >
                                                Save Anyway
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            onPress={() => setIsPreviewingFixes(false)}
                                            className="flex-none w-12 rounded-xl"
                                            isIconOnly
                                        >
                                            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onPress={async () => {
                                                actions.autoFix();
                                                setIsPreviewingFixes(false);
                                                setShowSaveModal(false);
                                                await actions.saveWorkflow();
                                            }}
                                            className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
                                        >
                                            Apply Fixes & Save
                                        </Button>
                                    </>
                                )}
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <SaveNamingModal
                isOpen={showNamingModal}
                onClose={() => setShowNamingModal(false)}
                onConfirm={handleConfirmName}
                currentName={workflowName}
            />
        </div>
    );
}
