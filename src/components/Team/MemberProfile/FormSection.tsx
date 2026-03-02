import type { ReactNode } from "react";
import { Button, Separator } from "@heroui/react";
import { TEXT_SUBSECTION_LABEL, FORM_ACTION_ROW, FLEX_COL_GAP_4 } from "../../../constants/ui-tokens";

// ─── FormActionRow ────────────────────────────────────────────────────────────

interface FormActionRowProps {
    isDirty: boolean;
    isSaving?: boolean;
    onCancel: () => void;
    onSave: () => void;
    /** Defaults to "Save changes" */
    saveLabel?: string;
}

/**
 * FormActionRow — Cancel + Save button pair used in form section footers and
 * shared tab footers. Single source of truth for the action row pattern.
 */
export function FormActionRow({
    isDirty,
    isSaving = false,
    onCancel,
    onSave,
    saveLabel = "Save changes",
}: FormActionRowProps) {
    return (
        <div className={FORM_ACTION_ROW}>
            <Button
                variant="ghost"
                size="sm"
                onPress={onCancel}
                isDisabled={!isDirty || isSaving}
            >
                Cancel
            </Button>
            <Button
                size="sm"
                onPress={onSave}
                isDisabled={!isDirty || isSaving}
            >
                {isSaving ? "Saving…" : saveLabel}
            </Button>
        </div>
    );
}

// ─── FormSection ──────────────────────────────────────────────────────────────

interface FormSectionProps {
    title: string;
    description?: string;
    isDirty: boolean;
    onCancel: () => void;
    onSave: () => void;
    isSaving?: boolean;
    /** Defaults to "Save changes" */
    saveLabel?: string;
    isFirst?: boolean;
    /** Set to false to suppress the built-in action row (use when the parent renders a shared footer). Default: true */
    showActions?: boolean;
    children: ReactNode;
}

/**
 * FormSection — Reusable two-column section wrapper for profile tabs.
 *
 * Layout:
 * - Left column (md:w-1/3): title + optional description
 * - Right column (md:w-2/3): form fields (children)
 * - Cancel / Save buttons always visible; disabled until isDirty
 * - Separator above section (omitted on first section via isFirst)
 */
export function FormSection({
    title,
    description,
    isDirty,
    onCancel,
    onSave,
    isSaving = false,
    saveLabel = "Save changes",
    isFirst = false,
    showActions = true,
    children,
}: FormSectionProps) {
    return (
        <div className="flex flex-col gap-6">
            {!isFirst && <Separator />}

            {/* Two-column layout */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: title + description */}
                <div className="md:w-1/3 shrink-0">
                    <h3 className={TEXT_SUBSECTION_LABEL}>{title}</h3>
                    {description && (
                        <p className="mt-1 text-xs text-default-600 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Right: form content */}
                <div className={`flex-1 ${FLEX_COL_GAP_4}`}>{children}</div>
            </div>

            {/* Action row — always visible; buttons disabled until dirty */}
            {showActions && (
                <FormActionRow
                    isDirty={isDirty}
                    isSaving={isSaving}
                    onCancel={onCancel}
                    onSave={onSave}
                    saveLabel={saveLabel}
                />
            )}
        </div>
    );
}
