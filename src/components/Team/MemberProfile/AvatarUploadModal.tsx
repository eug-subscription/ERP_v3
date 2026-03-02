import { useRef, useState, useCallback, useEffect } from "react";
import type { Area, Point } from "react-easy-crop";
import { Alert, Button, Modal, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { AvatarCropArea } from "./AvatarCropArea";
import { useAvatarUpload } from "../../../hooks/useAvatarUpload";
import { getCroppedImage } from "../../../utils/crop-image";
import {
    AVATAR_ACCEPTED_TYPES,
    AVATAR_ACCEPTED_LABEL,
    AVATAR_MAX_SIZE_BYTES,
    AVATAR_MIN_DIMENSION_PX,
    FILE_PICKER_OPEN_DELAY_MS,
} from "../../../constants/avatar-upload";
import {
    MODAL_ICON_DEFAULT,
    FORM_ACTION_ROW,
    MODAL_WIDTH_MD,
} from "../../../constants/ui-tokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarUploadModalProps {
    /** Whether the modal is open. Controlled by parent. */
    isOpen: boolean;
    /** Called by HeroUI when the modal should open or close. */
    onOpenChange: (isOpen: boolean) => void;
    /** The member's ID — forwarded to `useAvatarUpload` for cache update. */
    memberId: string;
    /** Whether the member currently has an avatar (shows Remove Photo button). */
    hasAvatar: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AvatarUploadModal — two-step avatar upload flow:
 *
 * Step 1 (no file): Drop zone + file picker button.
 * Step 2 (file selected): Circular crop area + zoom slider + Save/Cancel.
 *
 * Delegates file validation, HEIC conversion, and mock mutation to
 * `useAvatarUpload`. Delegates crop rendering to `AvatarCropArea`.
 */
export function AvatarUploadModal({
    isOpen,
    onOpenChange,
    memberId,
    hasAvatar,
}: AvatarUploadModalProps) {
    // ── Hook ──────────────────────────────────────────────────────────────────
    const { prepareFile, mutate, isConverting, isPending, validationError, clearValidationError } =
        useAvatarUpload({ memberId });

    // ── Local state ───────────────────────────────────────────────────────────
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Revoke the current preview URL and reset all crop state. */
    const resetCropState = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        clearValidationError();
    }, [previewUrl, clearValidationError]);

    /** Process a raw File through validation + HEIC conversion. */
    const handleFile = useCallback(
        async (file: File) => {
            resetCropState();
            const url = await prepareFile(file);
            if (url) {
                setPreviewUrl(url);
            }
        },
        [prepareFile, resetCropState],
    );

    // ── Event handlers ────────────────────────────────────────────────────────

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            // Reset input so the same file can be re-selected
            e.target.value = "";
        },
        [handleFile],
    );

    const handleDropZoneClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
        },
        [handleFile],
    );

    const handleCropComplete = useCallback((_: Area, pixelCrop: Area) => {
        setCroppedAreaPixels(pixelCrop);
    }, []);

    const handleSave = useCallback(async () => {
        if (!previewUrl || !croppedAreaPixels) return;
        const blob = await getCroppedImage(previewUrl, croppedAreaPixels);
        await mutate(blob);
        onOpenChange(false);
    }, [previewUrl, croppedAreaPixels, mutate, onOpenChange]);

    const handleRemove = useCallback(async () => {
        await mutate(null);
        onOpenChange(false);
    }, [mutate, onOpenChange]);

    const handleChooseDifferent = useCallback(() => {
        resetCropState();
        // Small delay to ensure state is settled before opening picker
        setTimeout(() => fileInputRef.current?.click(), FILE_PICKER_OPEN_DELAY_MS);
    }, [resetCropState]);

    // ── Clean up on modal close ───────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            resetCropState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const hasCrop = previewUrl !== null && croppedAreaPixels !== null;
    const isBusy = isConverting || isPending;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* Hidden native file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={(AVATAR_ACCEPTED_TYPES as readonly string[]).join(",")}
                className="hidden"
                aria-hidden
                onChange={handleFileInputChange}
            />

            <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} variant="blur">
                <Modal.Container size="sm">
                    <Modal.Dialog className={MODAL_WIDTH_MD} aria-label="Update profile photo">
                        <Modal.CloseTrigger />

                        {/* ── Header ── */}
                        <Modal.Header>
                            <Modal.Icon className={MODAL_ICON_DEFAULT}>
                                <Icon icon="lucide:image-up" className="w-5 h-5" aria-hidden />
                            </Modal.Icon>
                            <Modal.Heading>Update Profile Photo</Modal.Heading>
                        </Modal.Header>

                        {/* ── Body ── */}
                        <Modal.Body className="p-6">
                            {/* Converting spinner */}
                            {isConverting && (
                                <div className="flex flex-col items-center gap-3 py-8">
                                    <Spinner size="lg" />
                                    <p className="text-sm text-default-500">Converting image…</p>
                                </div>
                            )}

                            {/* Step 1 — Drop zone */}
                            {!isConverting && !previewUrl && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Upload photo — click or drag to upload"
                                    className={[
                                        "flex flex-col items-center justify-center gap-3",
                                        "rounded-xl border-2 border-dashed p-10",
                                        "cursor-pointer transition-colors duration-150",
                                        "outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                                        isDraggingOver
                                            ? "border-accent bg-accent/5"
                                            : "border-default-300 hover:border-accent/60 hover:bg-default/50",
                                    ].join(" ")}
                                    onClick={handleDropZoneClick}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            handleDropZoneClick();
                                        }
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex size-12 items-center justify-center rounded-full bg-accent/10">
                                        <Icon
                                            icon="lucide:upload-cloud"
                                            className="w-6 h-6 text-accent"
                                            aria-hidden
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-foreground">
                                            Click or drag to upload
                                        </p>
                                        <p className="mt-0.5 text-xs text-default-400">
                                            {AVATAR_ACCEPTED_LABEL} · Max {AVATAR_MAX_SIZE_BYTES / (1024 * 1024)} MB · Min {AVATAR_MIN_DIMENSION_PX} × {AVATAR_MIN_DIMENSION_PX} px
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 — Crop area */}
                            {!isConverting && previewUrl && (
                                <div className="flex flex-col gap-4">
                                    <AvatarCropArea
                                        imageSrc={previewUrl}
                                        crop={crop}
                                        zoom={zoom}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={handleCropComplete}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="self-start text-default-500"
                                        isDisabled={isBusy}
                                        onPress={handleChooseDifferent}
                                    >
                                        Choose different photo
                                    </Button>
                                </div>
                            )}

                            {/* Validation error */}
                            {validationError && (
                                <Alert
                                    status="danger"
                                    className="mt-4"
                                    title={validationError}
                                />
                            )}
                        </Modal.Body>

                        {/* ── Footer ── */}
                        <Modal.Footer>
                            <div className={`${FORM_ACTION_ROW} w-full`}>
                                {/* Remove photo — only when the member has an existing avatar */}
                                {hasAvatar && !previewUrl && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mr-auto text-danger hover:bg-danger/10"
                                        isDisabled={isBusy}
                                        onPress={() => void handleRemove()}
                                        aria-label="Remove profile photo"
                                    >
                                        Remove Photo
                                    </Button>
                                )}

                                <Button
                                    variant="secondary"
                                    slot="close"
                                    isDisabled={isBusy}
                                    aria-label="Cancel"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="primary"
                                    isDisabled={!hasCrop || isBusy}
                                    onPress={() => void handleSave()}
                                    aria-label="Save profile photo"
                                >
                                    {isPending ? (
                                        <>
                                            <Spinner size="sm" />
                                            Saving…
                                        </>
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
}
