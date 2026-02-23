import { useState } from "react";
import { Button, Chip, Checkbox, Dropdown, Label, Tooltip, Modal } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Table } from "../pricing/Table";
import { BulkActionBar } from "./BulkActionBar";
import { formatRelativeTime, formatAbsoluteTime } from "../../utils/format-time";
import { getHighResUrl } from "../../utils/image-url";
import { TOOLTIP_DELAY, MODAL_BACKDROP, MODAL_WIDTH_LG, PREVIEW_IMAGE_MIN_HEIGHT, PREVIEW_IMAGE_MAX_HEIGHT, ACTION_BUTTON_ICON } from "../../constants/ui-tokens";
import type { ShotListItem } from "../../types/shot-list";
import { SHOT_LIST_STATUS_CONFIG } from "../../constants/shot-list";

interface ShotListTableProps {
    items: ShotListItem[];
}

export function ShotListTable({ items }: ShotListTableProps) {
    const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const allSelected = items.length > 0 && selectedIds.size === items.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < items.length;

    function toggleAll() {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.id)));
        }
    }

    function toggleItem(id: number) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });
    }

    function clearSelection() {
        setSelectedIds(new Set());
    }

    return (
        <div className={selectedIds.size > 0 ? "pb-20" : ""}>
            <Table>
                <Table.Header>
                    <tr>
                        <Table.Column className="w-10">
                            <Checkbox
                                isSelected={allSelected}
                                isIndeterminate={isIndeterminate}
                                onChange={toggleAll}
                                aria-label="Select all"
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                            </Checkbox>
                        </Table.Column>
                        <Table.Column>Image</Table.Column>
                        <Table.Column isBlack>ID</Table.Column>
                        <Table.Column isBlack>Name</Table.Column>
                        <Table.Column>Status</Table.Column>
                        <Table.Column>Creator</Table.Column>
                        <Table.Column>Created at</Table.Column>
                        <Table.Column align="right">Actions</Table.Column>
                    </tr>
                </Table.Header>
                <Table.Body>
                    {items.map((item) => {
                        const statusCfg = SHOT_LIST_STATUS_CONFIG[item.status];
                        const isSelected = selectedIds.has(item.id);

                        return (
                            <Table.Row key={item.id} className={isSelected ? "!bg-accent/5" : ""}>
                                {/* Checkbox */}
                                <Table.Cell>
                                    <Checkbox
                                        isSelected={isSelected}
                                        onChange={() => toggleItem(item.id)}
                                        aria-label={`Select ${item.name}`}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox>
                                </Table.Cell>

                                {/* Image thumbnails */}
                                <Table.Cell>
                                    <div className="flex -space-x-4">
                                        {(item.status === "approved" || item.status === "await-moderation" || item.status === "completed") && item.images.length > 0 ? (
                                            item.images.slice(0, 3).map((url, idx) => (
                                                <Button
                                                    key={url}
                                                    isIconOnly
                                                    variant="ghost"
                                                    className="relative w-10 h-10 rounded-lg bg-default border-2 border-surface overflow-hidden hover:z-10 transition-transform hover:scale-110 shadow-sm shrink-0 p-0"
                                                    onPress={() => setPreviewImage({ url, name: item.name })}
                                                    aria-label={`Preview ${item.name} photo ${idx + 1}`}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${item.name} thumbnail ${idx + 1}`}
                                                        className="w-10 h-10 object-cover"
                                                    />
                                                </Button>
                                            ))
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-default flex items-center justify-center border border-default-200 shrink-0">
                                                <Icon icon="lucide:image" className="w-5 h-5 text-default-400" />
                                            </div>
                                        )}
                                        {(item.status === "approved" || item.status === "await-moderation" || item.status === "completed") && item.images.length > 3 && (
                                            <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center border-2 border-surface text-mini font-bold text-default-600 z-0">
                                                +{item.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </Table.Cell>

                                {/* ID */}
                                <Table.Cell>
                                    <span className="font-mono text-sm text-default-500">{item.id}</span>
                                </Table.Cell>

                                {/* Name */}
                                <Table.Cell>
                                    <div>
                                        <span className="text-xs text-default-400 font-mono">[{item.externalId}]</span>
                                        <div className="text-sm font-medium text-default-900">{item.name}</div>
                                    </div>
                                </Table.Cell>

                                {/* Status */}
                                <Table.Cell>
                                    <Chip size="sm" variant="soft" color={statusCfg.color}>
                                        {statusCfg.label}
                                    </Chip>
                                </Table.Cell>

                                {/* Creator */}
                                <Table.Cell>
                                    <div>
                                        <div className="text-sm font-medium text-default-900">{item.creatorName}</div>
                                        <div className="text-xs text-default-400 font-normal">{item.creatorRole}</div>
                                    </div>
                                </Table.Cell>

                                {/* Created at */}
                                <Table.Cell>
                                    <Tooltip delay={TOOLTIP_DELAY}>
                                        <Tooltip.Trigger>
                                            <span className="text-xs font-medium text-default-500 whitespace-nowrap cursor-default">
                                                {formatRelativeTime(item.createdAt)}
                                            </span>
                                        </Tooltip.Trigger>
                                        <Tooltip.Content>{formatAbsoluteTime(item.createdAt)}</Tooltip.Content>
                                    </Tooltip>
                                </Table.Cell>

                                {/* 3-dots actions */}
                                <Table.Cell align="right">
                                    <Dropdown>
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            aria-label="Row actions"
                                            className={ACTION_BUTTON_ICON}
                                        >
                                            <Icon icon="lucide:ellipsis-vertical" className="w-4 h-4" />
                                        </Button>
                                        <Dropdown.Popover placement="bottom end">
                                            <Dropdown.Menu
                                                onAction={(_key) => {
                                                    // TODO: connect to action handlers
                                                }}
                                            >
                                                <Dropdown.Item id="edit" textValue="Edit">
                                                    <Icon icon="lucide:pencil" className="w-4 h-4 text-default-500" />
                                                    <Label>Edit</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="send-to-order" textValue="Send to order">
                                                    <Icon icon="lucide:arrow-right-left" className="w-4 h-4 text-default-500" />
                                                    <Label>Send to order</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="download" textValue="Download">
                                                    <Icon icon="lucide:download" className="w-4 h-4 text-default-500" />
                                                    <Label>Download</Label>
                                                </Dropdown.Item>
                                                <Dropdown.Item id="delete" textValue="Delete" className="text-danger">
                                                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                                    <Label>Delete</Label>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>

            {/* Image preview modal */}
            <Modal isOpen={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <Modal.Backdrop className={MODAL_BACKDROP}>
                    <Modal.Container className={MODAL_WIDTH_LG}>
                        <Modal.Dialog>
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Heading>{previewImage?.name}</Modal.Heading>
                            </Modal.Header>
                            <Modal.Body className="p-0 overflow-hidden">
                                <div className={`bg-surface flex items-center justify-center p-2 ${PREVIEW_IMAGE_MIN_HEIGHT}`}>
                                    {previewImage && (
                                        <img
                                            src={getHighResUrl(previewImage.url)}
                                            alt={previewImage.name}
                                            className={`max-w-full h-auto ${PREVIEW_IMAGE_MAX_HEIGHT} object-contain rounded-lg shadow-2xl`}
                                        />
                                    )}
                                </div>
                            </Modal.Body>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>

            <BulkActionBar selectedCount={selectedIds.size} onClear={clearSelection} />
        </div>
    );
}
