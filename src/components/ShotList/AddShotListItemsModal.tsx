import { useState, useRef } from "react";
import {
    Modal, Button, Alert,
    RadioGroup, Radio, Label, Description,
    TextField, Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { MODAL_BACKDROP, ICON_CONTAINER_LG, ICON_SIZE_CONTAINER, MODAL_WIDTH_FORM } from "../../constants/ui-tokens";

type ImportMode = "replace" | "supplement";
type Phase = "input" | "confirm";

// TODO: Replace ParseResult data with real API response when available
interface ParseResult {
    totalItems: number;
    duplicates: number;
}

interface AddShotListItemsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddShotListItemsModal({ isOpen, onOpenChange }: AddShotListItemsModalProps) {
    const [phase, setPhase] = useState<Phase>("input");
    const [mode, setMode] = useState<ImportMode>("replace");
    const [fileUrl, setFileUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasInput = fileUrl.trim().length > 0 || selectedFile !== null;

    function handleClose() {
        onOpenChange(false);
    }

    function handleReset() {
        setPhase("input");
        setMode("replace");
        setFileUrl("");
        setSelectedFile(null);
        setParseResult(null);
    }

    function handleOpenChange(open: boolean) {
        if (!open) handleReset();
        onOpenChange(open);
    }

    function handleFileSelect(file: File) {
        setSelectedFile(file);
        setFileUrl("");
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }

    function handleUploadAndPreview() {
        // TODO: replace with real parse API call
        setParseResult({ totalItems: 130, duplicates: 3 });
        setPhase("confirm");
    }

    function handleApply() {
        // TODO: dispatch actual import action
        handleClose();
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Backdrop className={MODAL_BACKDROP}>
                <Modal.Container className={MODAL_WIDTH_FORM}>
                    <Modal.Dialog>
                        <Modal.CloseTrigger />

                        <Modal.Header>
                            <div className="flex items-center gap-3">
                                <div className={ICON_CONTAINER_LG}>
                                    <Icon icon="lucide:list-plus" className={ICON_SIZE_CONTAINER} />
                                </div>
                                <div>
                                    <Modal.Heading>Add Items</Modal.Heading>
                                    <p className="text-xs text-default-400 mt-0.5 font-medium">
                                        {phase === "input"
                                            ? "Provide a file URL or upload from your disk"
                                            : "Review the import summary before applying"}
                                    </p>
                                </div>
                            </div>
                        </Modal.Header>

                        <Modal.Body className="flex flex-col gap-6 px-6 py-5">
                            {phase === "input" ? (
                                <>
                                    {/* URL input */}
                                    <TextField
                                        className="w-full"
                                        name="shot-list-url"
                                        value={fileUrl}
                                        onChange={(v) => { setFileUrl(v); setSelectedFile(null); }}
                                    >
                                        <Label className="text-sm font-semibold text-default-700">File URL</Label>
                                        <Input
                                            placeholder="https://example.com/shot-list.csv"
                                            className="mt-1"
                                        />
                                        <Description className="text-xs text-default-400 mt-1">
                                            Accepts .csv, .xlsx, or .json
                                        </Description>
                                    </TextField>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-surface-secondary" />
                                        <span className="text-xs font-semibold text-default-400">or</span>
                                        <div className="flex-1 h-px bg-surface-secondary" />
                                    </div>

                                    {/* Drop zone */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                                            ${isDragOver
                                                ? "border-accent bg-accent/5"
                                                : selectedFile
                                                    ? "border-success/50 bg-success/5"
                                                    : "border-default-200 hover:border-accent/40 hover:bg-accent/5"}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept=".csv,.xlsx,.json"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleFileSelect(f);
                                            }}
                                        />
                                        {selectedFile ? (
                                            <>
                                                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                                                    <Icon icon="lucide:file-check-2" className="w-5 h-5 text-success" />
                                                </div>
                                                <p className="text-sm font-semibold text-default-900 mb-0.5 truncate max-w-xs">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-xs text-default-400">
                                                    Click to change file
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className={`${ICON_CONTAINER_LG} mb-3 group-hover:scale-110 transition-transform`}>
                                                    <Icon icon="lucide:upload-cloud" className={ICON_SIZE_CONTAINER} />
                                                </div>
                                                <p className="text-sm font-semibold text-default-900 mb-0.5">
                                                    Click to upload or drag & drop
                                                </p>
                                                <p className="text-xs text-default-400">CSV, XLSX or JSON</p>
                                            </>
                                        )}
                                    </div>

                                    {/* Mode selector */}
                                    <div>
                                        <p className="text-sm font-semibold text-default-700 mb-3">Import mode</p>
                                        <RadioGroup
                                            name="import-mode"
                                            value={mode}
                                            onChange={(v) => setMode(v as ImportMode)}
                                            variant="primary"
                                        >
                                            <Radio value="replace">
                                                <Radio.Control>
                                                    <Radio.Indicator />
                                                </Radio.Control>
                                                <Radio.Content>
                                                    <Label className="text-sm font-medium">Fully replace the current list</Label>
                                                    <Description className="text-xs text-default-400">
                                                        All existing items will be removed and replaced
                                                    </Description>
                                                </Radio.Content>
                                            </Radio>
                                            <Radio value="supplement">
                                                <Radio.Control>
                                                    <Radio.Indicator />
                                                </Radio.Control>
                                                <Radio.Content>
                                                    <Label className="text-sm font-medium">Supplement with new items</Label>
                                                    <Description className="text-xs text-default-400">
                                                        New items will be added; existing items are kept
                                                    </Description>
                                                </Radio.Content>
                                            </Radio>
                                        </RadioGroup>
                                    </div>
                                </>
                            ) : (
                                // Confirmation phase
                                parseResult && (
                                    <Alert status={parseResult.duplicates > 0 ? "warning" : "success"} className="rounded-2xl">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Title className="font-semibold">
                                                File parsed successfully
                                            </Alert.Title>
                                            <Alert.Description className="mt-1 text-sm leading-relaxed">
                                                The file contains{" "}
                                                <span className="font-bold text-foreground">{parseResult.totalItems} items</span>
                                                {parseResult.duplicates > 0 && (
                                                    <>
                                                        ,{" "}
                                                        <span className="font-bold text-foreground">{parseResult.duplicates}</span>{" "}
                                                        of which already exist in the current list
                                                    </>
                                                )}
                                                .{" "}
                                                {mode === "replace"
                                                    ? "The current list will be fully replaced."
                                                    : "Duplicate items will be skipped."}
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert>
                                )
                            )}
                        </Modal.Body>

                        <Modal.Footer className="flex items-center gap-2 px-6 pb-5 pt-0">
                            {phase === "confirm" && (
                                <Button
                                    isIconOnly
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl mr-auto"
                                    aria-label="Back"
                                    onPress={() => setPhase("input")}
                                >
                                    <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                onPress={handleClose}
                            >
                                Cancel
                            </Button>
                            {phase === "input" ? (
                                <Button
                                    variant="primary"
                                    isDisabled={!hasInput}
                                    onPress={handleUploadAndPreview}
                                >
                                    <Icon icon="lucide:eye" className="w-4 h-4 mr-1.5" />
                                    Upload & Preview
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onPress={handleApply}
                                >
                                    <Icon icon="lucide:check" className="w-4 h-4 mr-1.5" />
                                    Apply
                                </Button>
                            )}
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
