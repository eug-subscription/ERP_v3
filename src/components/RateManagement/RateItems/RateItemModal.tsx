import {
    Button,
    Modal,
    TextField,
    Description,
    ComboBox,
    ListBox,
    Form,
    Label,
    Input,
    FieldError,
    Surface,
    TextArea,
    Autocomplete,
    Tag,
    TagGroup,
    SearchField,
    EmptyState,
    useFilter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { RateItem, UnitType, Status } from "../../../types/pricing";
import { WorkflowBlockType } from "../../../types/workflow";
import { useState } from "react";
import { centeredModalStyles } from "../../../styles/modal-variants";
import { RATE_UNIT_TYPES, PRICING_STATUSES, BILLABLE_BLOCK_TYPES } from "../../../constants/pricing-data";

interface RateItemModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    item?: RateItem;
    onSuccess: (item: Partial<RateItem>) => void;
    isPending?: boolean;
}


/**
 * RateItemForm - Internal component to handle form state and submission.
 * Encapsulated to allow for easy state resets via the 'key' pattern.
 */
function RateItemForm({
    item,
    onSuccess,
    onOpenChange,
    isPending,
    styles
}: {
    item?: RateItem;
    onSuccess: (item: Partial<RateItem>) => void;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    styles: ReturnType<typeof centeredModalStyles>;
}) {
    const [name, setName] = useState(item?.name || "");
    const [displayName, setDisplayName] = useState(item?.displayName ?? "");
    const [description, setDescription] = useState(item?.description ?? "");
    const [unitType, setUnitType] = useState<UnitType>(item?.unitType || "hour");
    const [status, setStatus] = useState<Status>(item?.status || "active");
    const [blockTypes, setBlockTypes] = useState<WorkflowBlockType[]>(item?.blockTypes || []);
    const { contains } = useFilter({ sensitivity: "base" });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSuccess({
            ...(item && { id: item.id }),
            name,
            displayName: displayName || undefined,
            description: description || undefined,
            unitType,
            blockTypes: blockTypes.length > 0 ? blockTypes : undefined,
            status,
        });
        onOpenChange(false);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Modal.Body className={styles.body()}>
                <TextField
                    isRequired
                    name="name"
                    value={name}
                    onChange={setName}
                    validate={(value) => {
                        if (!value.trim()) return "Identification required";
                        return null;
                    }}
                    className={styles.inputContainer()}
                >
                    <Label className={styles.label()}>Registry Name</Label>
                    <Input
                        autoFocus
                        placeholder="e.g. Master Photography Hour"
                        className={styles.input()}
                    />
                    <FieldError className="text-xs text-danger mt-1.5 font-medium px-2" />
                </TextField>

                <TextField
                    isRequired={false}
                    name="displayName"
                    value={displayName}
                    onChange={setDisplayName}
                    className={styles.inputContainer()}
                >
                    <Label className={styles.label()}>Display Name</Label>
                    <Description className="text-xs text-foreground-500 mb-2">
                        What appears on invoices and reports (optional, defaults to Name)
                    </Description>
                    <Input
                        placeholder="e.g., Photo Shoot"
                        className={styles.input()}
                    />
                </TextField>

                <TextField
                    isRequired={false}
                    name="description"
                    value={description}
                    onChange={setDescription}
                    className={styles.inputContainer()}
                >
                    <Label className={styles.label()}>Description</Label>
                    <Description className="text-xs text-foreground-500 mb-2">
                        Context hint for operators selecting this item (optional)
                    </Description>
                    <TextArea
                        placeholder="e.g., Billable time for on-location or studio photography sessions"
                        className="min-h-[80px] resize-none"
                    />
                </TextField>

                <Autocomplete
                    className={styles.inputContainer()}
                    placeholder="Add workflow block…"
                    selectionMode="multiple"
                    value={blockTypes}
                    onChange={(keys) => setBlockTypes(keys as WorkflowBlockType[])}
                >
                    <Label className={styles.label()}>Workflow Blocks</Label>
                    <Autocomplete.Trigger>
                        <Autocomplete.Value>
                            {({ defaultChildren, isPlaceholder, state }: {
                                defaultChildren: React.ReactNode;
                                isPlaceholder: boolean;
                                state: { selectedItems: Array<{ key: React.Key }> };
                            }) => {
                                if (isPlaceholder || state.selectedItems.length === 0) {
                                    return defaultChildren;
                                }

                                const selectedItemsKeys = state.selectedItems.map((item: { key: React.Key }) => item.key);

                                return (
                                    <TagGroup
                                        size="sm"
                                        onRemove={(keys: Set<React.Key>) => {
                                            setBlockTypes(prev => prev.filter(type => !keys.has(type)));
                                        }}
                                    >
                                        <TagGroup.List>
                                            {selectedItemsKeys.map((selectedItemKey: React.Key) => {
                                                const blockType = BILLABLE_BLOCK_TYPES.find(
                                                    (b) => b.id === selectedItemKey
                                                );

                                                if (!blockType) return null;

                                                return (
                                                    <Tag key={blockType.id} id={blockType.id}>
                                                        {blockType.label}
                                                    </Tag>
                                                );
                                            })}
                                        </TagGroup.List>
                                    </TagGroup>
                                );
                            }}
                        </Autocomplete.Value>
                        <Autocomplete.ClearButton />
                        <Autocomplete.Indicator />
                    </Autocomplete.Trigger>
                    <Description className="text-xs text-foreground-500 mb-0">
                        Link to workflow blocks for automatic billing (optional)
                    </Description>
                    <Autocomplete.Popover>
                        <Autocomplete.Filter filter={contains}>
                            <SearchField autoFocus name="search" variant="secondary">
                                <SearchField.Group>
                                    <SearchField.SearchIcon />
                                    <SearchField.Input placeholder="Search..." />
                                    <SearchField.ClearButton />
                                </SearchField.Group>
                            </SearchField>
                            <ListBox renderEmptyState={() => <EmptyState>No matches</EmptyState>}>
                                {BILLABLE_BLOCK_TYPES.map((blockType) => (
                                    <ListBox.Item
                                        key={blockType.id}
                                        id={blockType.id}
                                        textValue={blockType.label}
                                    >
                                        {blockType.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Autocomplete.Filter>
                    </Autocomplete.Popover>
                </Autocomplete>

                <div className="grid grid-cols-2 gap-4">
                    <ComboBox
                        isRequired
                        selectedKey={unitType}
                        onSelectionChange={(key) => key && setUnitType(key as UnitType)}
                        className={styles.inputContainer()}
                    >
                        <Label className={styles.label()}>Unit Type</Label>
                        <ComboBox.InputGroup className={styles.comboInputGroup()}>
                            <Input
                                className="w-full h-full bg-transparent border-none px-4 font-medium"
                                placeholder="Search..."
                            />
                            <ComboBox.Trigger className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-default-400 hover:text-accent transition-colors">
                                <Icon icon="lucide:chevron-down" width={16} />
                            </ComboBox.Trigger>
                        </ComboBox.InputGroup>
                        <ComboBox.Popover
                            placement="bottom"
                            className="w-(--trigger-width) rounded-2xl border border-default-100/50 shadow-md backdrop-blur-xl bg-surface-base/95 max-h-72 overflow-y-auto"
                        >
                            <ListBox className="p-2 gap-1 text-left">
                                {RATE_UNIT_TYPES.map((type) => (
                                    <ListBox.Item
                                        key={type.id}
                                        id={type.id}
                                        textValue={type.label}
                                        className="rounded-lg h-10 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent font-medium px-3 justify-start flex items-center"
                                    >
                                        {type.label}
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </ComboBox.Popover>
                    </ComboBox>

                    <ComboBox
                        isRequired
                        selectedKey={status}
                        onSelectionChange={(key) => key && setStatus(key as Status)}
                        className={styles.inputContainer()}
                    >
                        <Label className={styles.label()}>State</Label>
                        <ComboBox.InputGroup className={styles.comboInputGroup()}>
                            <Input
                                className="w-full h-full bg-transparent border-none px-4 font-medium"
                                placeholder="Search..."
                            />
                            <ComboBox.Trigger className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-default-400 hover:text-accent transition-colors">
                                <Icon icon="lucide:chevron-down" width={16} />
                            </ComboBox.Trigger>
                        </ComboBox.InputGroup>
                        <ComboBox.Popover
                            placement="bottom"
                            className="w-(--trigger-width) rounded-2xl border border-default-100/50 shadow-md backdrop-blur-xl bg-surface-base/95 max-h-72 overflow-y-auto"
                        >
                            <ListBox className="p-2 gap-1 text-left">
                                {PRICING_STATUSES.map((s) => (
                                    <ListBox.Item
                                        key={s.id}
                                        id={s.id}
                                        textValue={s.label}
                                        className="rounded-lg h-10 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent font-medium px-3 justify-start flex items-center"
                                    >
                                        {s.label}
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </ComboBox.Popover>
                    </ComboBox>
                </div>
            </Modal.Body>

            <Modal.Footer className={styles.footer()}>
                <Button
                    variant="ghost"
                    onPress={() => onOpenChange(false)}
                    className={styles.cancelButton()}
                >
                    Dismiss
                </Button>
                <Button
                    type="submit"
                    className={styles.submitButton()}
                    isPending={isPending}
                >
                    {item ? "Commit Changes" : "Create Unit"}
                </Button>
            </Modal.Footer>
        </Form>
    );
}

/**
 * RateItemModal - Modal form for creating or editing a rate item.
 * Refined with 'Avant-Garde' premium aesthetics and Compact UX.
 */
export function RateItemModal({ isOpen, onOpenChange, item, onSuccess, isPending = false }: RateItemModalProps) {
    const styles = centeredModalStyles();

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <Modal.Backdrop className="backdrop-blur-sm bg-black/20">
                <Modal.Container>
                    <Modal.Dialog className={styles.dialog()}>
                        <Surface className="w-full h-full bg-transparent">
                            <Modal.CloseTrigger className={styles.closeButton()}>
                                <Icon icon="lucide:x" width={16} className="text-default-500" />
                            </Modal.CloseTrigger>

                            <Modal.Header className={styles.header()}>
                                <div className={styles.iconWrapper()}>
                                    <Icon icon={item ? "lucide:edit-3" : "lucide:plus"} width={24} />
                                </div>
                                <div className="space-y-1">
                                    <Modal.Heading className="text-xl font-bold tracking-tight text-foreground">
                                        {item ? "Refine Rate Item" : "New Pricing Unit"}
                                    </Modal.Heading>
                                    <p className={styles.headerDescription()}>
                                        {item ? "Modify the core parameters for this item" : "Establish a new billable atomic unit"}
                                    </p>
                                </div>
                            </Modal.Header>

                            <RateItemForm
                                key={`${isOpen}-${item?.id || 'new'}`}
                                item={item}
                                onSuccess={onSuccess}
                                onOpenChange={onOpenChange}
                                isPending={isPending}
                                styles={styles}
                            />
                        </Surface>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
