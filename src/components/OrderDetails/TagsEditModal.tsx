import { useEffect, useState } from 'react';
import type { Key } from '@heroui/react';
import { Button, ComboBox, FieldError, Input, Label, ListBox, Modal, Separator, Tag, TagGroup, TextField } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { OrderTag } from '../../data/mock-order';
import { availableTags } from '../../data/mock-order';
import { useUpdateTags } from '../../hooks/useUpdateTags';
import { useUpdateOrderName } from '../../hooks/useUpdateOrderName';
import { MODAL_WIDTH_MD, MODAL_BACKDROP, TEXT_MODAL_SECTION_LABEL, MODAL_ICON_DEFAULT } from '../../constants/ui-tokens';

interface TagsEditModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orderName: string;
    currentTags: OrderTag[];
}

export function TagsEditModal({ isOpen, onOpenChange, orderName, currentTags }: TagsEditModalProps) {
    const updateTags = useUpdateTags();
    const updateName = useUpdateOrderName();

    const [tags, setTags] = useState<OrderTag[]>([]);
    const [nameDraft, setNameDraft] = useState(orderName);
    const [submitted, setSubmitted] = useState(false);
    const [selectedKey, setSelectedKey] = useState<Key | null>(null);

    // Re-initialise each time the modal opens
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTags(currentTags);
            setNameDraft(orderName);
            setSubmitted(false);
            setSelectedKey(null);
        }
    }, [isOpen, currentTags, orderName]);

    const existingIds = new Set(tags.map((t) => t.id));
    const availableToAdd = availableTags.filter((t) => !existingIds.has(t.id));

    function handleAdd() {
        if (!selectedKey) return;
        const tag = availableTags.find((t) => t.id === String(selectedKey));
        if (!tag) return;
        setTags((prev) => [...prev, tag]);
        setSelectedKey(null);
    }

    function handleRemove(keys: Set<Key>) {
        setTags((prev) => prev.filter((t) => !keys.has(t.id)));
    }

    async function handleSave() {
        setSubmitted(true);
        if (nameDraft.trim() === '') return;

        await Promise.all([
            updateName.mutateAsync(nameDraft.trim()),
            updateTags.mutateAsync(tags),
        ]);
        onOpenChange(false);
    }

    const isPending = updateTags.isPending || updateName.isPending;
    const isNameInvalid = submitted && nameDraft.trim() === '';
    const isUnchanged =
        nameDraft.trim() === orderName &&
        tags.length === currentTags.length &&
        tags.every((t, i) => t.id === currentTags[i]?.id);

    return (
        <Modal.Backdrop className={MODAL_BACKDROP} isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className={MODAL_WIDTH_MD}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Icon className={MODAL_ICON_DEFAULT}>
                            <Icon icon="lucide:clipboard-list" className="size-5" />
                        </Modal.Icon>
                        <Modal.Heading>Edit Order</Modal.Heading>
                        <p className="text-sm leading-5 text-muted">Update the order name and tags below.</p>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4 px-6 pb-2">
                        {/* Order name */}
                        <TextField
                            fullWidth
                            isRequired
                            isInvalid={isNameInvalid}
                            name="order-name"
                            onChange={setNameDraft}
                        >
                            <Label className={TEXT_MODAL_SECTION_LABEL}>Order name</Label>
                            <Input value={nameDraft} placeholder="Enter order name…" />
                            <FieldError>Order name is required</FieldError>
                        </TextField>

                        <Separator />

                        {/* Current tags */}
                        <TagGroup
                            aria-label="Order tags"
                            selectionMode="none"
                            size="md"
                            onRemove={handleRemove}
                        >
                            <TagGroup.List
                                items={tags}
                                renderEmptyState={() => (
                                    <div className="flex items-center gap-2 py-1 text-sm text-default-400">
                                        <Icon icon="lucide:tag" className="size-4 shrink-0" />
                                        <span>No tags added yet</span>
                                    </div>
                                )}
                            >
                                {(tag) => (
                                    <Tag
                                        key={tag.id}
                                        id={tag.id}
                                        textValue={tag.text}
                                        className="bg-accent/15 text-accent border-accent/20"
                                    >
                                        {tag.text}
                                    </Tag>
                                )}
                            </TagGroup.List>
                        </TagGroup>

                        <Separator />

                        {/* Add tag — ComboBox + Add button */}
                        <div className="flex gap-2 items-end">
                            <ComboBox
                                selectedKey={selectedKey}
                                onSelectionChange={setSelectedKey}
                                className="flex-1"
                            >
                                <Label className={TEXT_MODAL_SECTION_LABEL}>Add tag</Label>
                                <ComboBox.InputGroup>
                                    <Input placeholder="Search tags…" />
                                    <ComboBox.Trigger />
                                </ComboBox.InputGroup>
                                <ComboBox.Popover>
                                    <ListBox>
                                        {availableToAdd.map((tag) => (
                                            <ListBox.Item
                                                key={tag.id}
                                                id={tag.id}
                                                textValue={tag.text}
                                            >
                                                {tag.text}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </ComboBox.Popover>
                            </ComboBox>
                            <Button
                                variant="secondary"
                                size="md"
                                isDisabled={!selectedKey}
                                onPress={handleAdd}
                                className="shrink-0"
                            >
                                <Icon icon="lucide:plus" className="size-4" />
                                Add
                            </Button>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button slot="close" variant="ghost">
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onPress={handleSave}
                            isPending={isPending}
                            isDisabled={isUnchanged}
                        >
                            Save changes
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
