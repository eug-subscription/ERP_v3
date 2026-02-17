import { Icon } from "@iconify/react";
import { AlertDialog, Button, Chip, Tooltip } from "@heroui/react";
import { Table } from "./pricing/Table";
import { TOOLTIP_DELAY, TRANSITION_DURATION_SLOW } from "../constants/ui-tokens";
import { formatFileSize } from "../utils/formatters";
import { UploadFile } from "../data/mock-upload";

interface UploadFileRowProps {
    file: UploadFile;
    onTogglePause?: (id: string) => void;
    onRetry?: (id: string) => void;
    onCancel?: (id: string) => void;
}

function StatusActionButton({ file, onTogglePause, onRetry }: Pick<UploadFileRowProps, "file" | "onTogglePause" | "onRetry">) {
    if (file.status === "completed") return null;

    const config = file.status === "failed"
        ? { icon: "lucide:rotate-ccw", tooltip: "Retry Upload", className: "hover:border-warning/20 hover:bg-warning/10 text-warning", handler: () => onRetry?.(file.id) }
        : file.status === "paused"
            ? { icon: "lucide:play", tooltip: "Resume Upload", className: "hover:border-success/20 hover:bg-success/10 text-success", handler: () => onTogglePause?.(file.id) }
            : { icon: "lucide:pause", tooltip: "Pause Upload", className: "hover:border-accent/20 hover:bg-accent/10 text-default-500", handler: () => onTogglePause?.(file.id) };

    return (
        <Tooltip delay={TOOLTIP_DELAY}>
            <Tooltip.Trigger>
                <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    className={`rounded-full bg-default-100/50 border border-transparent ${config.className}`}
                    onPress={config.handler}
                >
                    <Icon icon={config.icon} className="w-4 h-4" />
                </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>{config.tooltip}</Tooltip.Content>
        </Tooltip>
    );
}

export function UploadFileRow({ file, onTogglePause, onRetry, onCancel }: UploadFileRowProps) {
    return (
        <Table.Row>
            <Table.Cell>
                <div className="flex items-center gap-3">
                    <Icon icon="lucide:file" className="w-5 h-5 text-default-400" />
                    <span className="text-sm font-medium text-default-900">{file.name}</span>
                </div>
            </Table.Cell>
            <Table.Cell>
                <Chip
                    size="sm"
                    variant="soft"
                    color={
                        file.status === "completed"
                            ? "success"
                            : file.status === "failed"
                                ? "danger"
                                : file.status === "paused"
                                    ? "warning"
                                    : "accent"
                    }
                >
                    {file.status}
                </Chip>
            </Table.Cell>
            <Table.Cell>
                <div className="w-32 space-y-1">
                    <div className="w-full bg-default-100 rounded-full h-1.5">
                        <div
                            className={`bg-accent h-full rounded-full transition-all ${TRANSITION_DURATION_SLOW}`}
                            style={{ width: `${file.progress}%` }}
                        />
                    </div>
                    <span className="t-mini text-default-500 font-medium">
                        {file.progress}%
                    </span>
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="text-default-600 font-mono text-xs">
                    {formatFileSize(file.size)}
                </span>
            </Table.Cell>
            <Table.Cell align="right">
                <div className="flex items-center justify-end gap-1">
                    <StatusActionButton file={file} onTogglePause={onTogglePause} onRetry={onRetry} />
                    <AlertDialog>
                        <Tooltip delay={TOOLTIP_DELAY}>
                            <Tooltip.Trigger>
                                <Button
                                    isIconOnly
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full bg-default-100/50 border border-transparent hover:border-danger/20 hover:bg-danger/10 text-danger"
                                >
                                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                </Button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Cancel Upload</Tooltip.Content>
                        </Tooltip>
                        <AlertDialog.Backdrop variant="blur">
                            <AlertDialog.Container>
                                <AlertDialog.Dialog className="sm:max-w-[400px]">
                                    <AlertDialog.CloseTrigger />
                                    <AlertDialog.Header>
                                        <AlertDialog.Icon status="danger" />
                                        <AlertDialog.Heading>Delete this file?</AlertDialog.Heading>
                                    </AlertDialog.Header>
                                    <AlertDialog.Body>
                                        <p>
                                            This will permanently remove <strong>{file.name}</strong> from the upload queue. This action cannot be undone.
                                        </p>
                                    </AlertDialog.Body>
                                    <AlertDialog.Footer>
                                        <Button slot="close" variant="tertiary">
                                            Cancel
                                        </Button>
                                        <Button
                                            slot="close"
                                            variant="danger"
                                            onPress={() => onCancel?.(file.id)}
                                        >
                                            Delete File
                                        </Button>
                                    </AlertDialog.Footer>
                                </AlertDialog.Dialog>
                            </AlertDialog.Container>
                        </AlertDialog.Backdrop>
                    </AlertDialog>
                </div>
            </Table.Cell>
        </Table.Row>
    );
}
