import {
    Button,
    Modal,
    NumberField,
    ComboBox,
    ListBox,
    Form,
    Label,
    Input,
    InputGroup,
    Surface,
    Description,
    Disclosure,
    Separator,
    ScrollShadow
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { RateCard, RateCardEntry, AppliedRuleSnapshot } from "../../../types/pricing";
import { useState, useMemo } from "react";
import { useRateItems } from "../../../hooks/useRateItems";
import { MARGIN_DANGER_THRESHOLD } from "../../../constants/pricing";
import { getCurrencySymbol } from "../../../utils/currency";
import { tv } from "tailwind-variants";

interface RateCardEntryEditorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    card: RateCard;
    entry?: RateCardEntry;
    onSuccess: (entry: Partial<RateCardEntry>) => void;
}

const modalStyles = tv({
    slots: {
        backdrop: "backdrop-blur-md bg-black/20",
        dialog: "fixed top-0 right-0 h-screen w-full max-w-[360px] m-0 rounded-none border-l border-default-200 shadow-2xl bg-surface-base/95 backdrop-blur-md flex flex-col",
        header: "shrink-0 flex items-center justify-between p-4 border-b border-default-100 bg-transparent",
        iconWrapper: "shrink-0 w-10 h-10 rounded-xl bg-accent/[0.05] border border-accent/10 flex items-center justify-center text-accent shadow-sm",
        body: "flex-1 overflow-hidden p-0",
        footer: "shrink-0 p-4 flex gap-3 border-t border-default-100 bg-default-50/50 backdrop-blur-sm",
        inputContainer: "group relative flex flex-col gap-1.5",
        label: "t-mini font-bold uppercase tracking-[0.15em] text-default-400 px-0.5 transition-colors group-focus-within:text-accent",
        comboInputGroup: "relative w-full",
        closeButton: "shrink-0 w-9 h-9 flex items-center justify-center transition-colors text-default-400 hover:text-foreground hover:bg-default-100 rounded-full",
    },
    variants: {
        isOpen: {
            true: {
                backdrop: "animate-backdrop-in",
                dialog: "animate-slide-in-right"
            },
            false: {
                backdrop: "animate-backdrop-out",
                dialog: "animate-slide-out-right"
            }
        }
    }
});



/**
 * RateCardEntryEditor - Modal form for adding or editing a rate card entry.
 * Implements Task 2.2.3 with live margin calculation and rules editing.
 * Upgraded to 'Avant-Garde' premium aesthetics.
 */
export function RateCardEntryEditor({ isOpen, onOpenChange, card, entry, onSuccess }: RateCardEntryEditorProps) {
    const styles = modalStyles({ isOpen });
    const { data: rateItems = [] } = useRateItems();

    const [rateItemId, setRateItemId] = useState<string>(entry?.rateItemId || "");
    const [costRate, setCostRate] = useState<number>(entry?.costRate ?? 0);
    const [clientRate, setClientRate] = useState<number>(entry?.clientRate ?? 0);
    const [minQuantity, setMinQuantity] = useState<number>(() => {
        if (entry?.rulesJson) {
            try {
                const rules = JSON.parse(entry.rulesJson) as AppliedRuleSnapshot;
                return rules.ruleType === 'minimum' ? (rules.minimum || 0) : 0;
            } catch {
                return 0;
            }
        }
        return 0;
    });

    // Filtered rate items: only those not already in the card (for new entries)
    const availableItems = useMemo(() => {
        const existingItemIds = card.entries.map(e => e.rateItemId);
        return rateItems.filter(item =>
            item.status === 'active' &&
            (!existingItemIds.includes(item.id) || item.id === entry?.rateItemId)
        );
    }, [rateItems, card.entries, entry]);

    // Live margin calculation
    const margin = clientRate > 0 ? ((clientRate - costRate) / clientRate) * 100 : 0;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const rules: AppliedRuleSnapshot = minQuantity > 0 ? {
            schemaVersion: 1,
            ruleType: 'minimum',
            minimum: minQuantity,
            unit: rateItems.find(ri => ri.id === rateItemId)?.unitType === 'hour' ? 'hours' : 'units'
        } : { schemaVersion: 1, ruleType: 'none' };

        onSuccess({
            ...(entry && { id: entry.id }),
            rateCardId: card.id,
            rateItemId,
            costRate,
            clientRate,
            rulesJson: JSON.stringify(rules),
        });
        onOpenChange(false);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop className={styles.backdrop()}>
                <Modal.Container>
                    <Modal.Dialog className={styles.dialog()}>
                        <Surface className="w-full h-full bg-transparent flex flex-col overflow-hidden p-0">
                            <Modal.Header className={styles.header()}>
                                <div className="flex items-center gap-4 min-w-0 shrink-0 pr-8">
                                    <div className={styles.iconWrapper()}>
                                        <Icon icon={entry ? "lucide:edit-3" : "lucide:plus"} className="w-5 h-5 shrink-0" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <Modal.Heading className="text-base font-bold text-foreground leading-tight truncate">
                                            {entry ? "Edit Price Entry" : "New Price Entry"}
                                        </Modal.Heading>
                                        <p className="text-xs text-default-500 font-medium line-clamp-2 leading-snug">
                                            {entry ? "Update existing price entry and its operational rules" : "Configure market rates and operational rules for this item"}
                                        </p>
                                    </div>
                                </div>
                                <Modal.CloseTrigger className={styles.closeButton()}>
                                    <Icon icon="lucide:x" className="w-5 h-5" />
                                </Modal.CloseTrigger>
                            </Modal.Header>

                            <Form onSubmit={handleSubmit} key={isOpen ? `${card.id}-${entry?.id || 'new'}` : "closed"} className="flex flex-col flex-1 overflow-hidden">
                                <Modal.Body className={styles.body()}>
                                    <ScrollShadow className="h-full px-4 py-5 space-y-5">
                                        {/* Registry Item Selection */}
                                        <ComboBox
                                            isRequired
                                            selectedKey={rateItemId}
                                            onSelectionChange={(key) => setRateItemId(key as string)}
                                            className={styles.inputContainer()}
                                            isDisabled={!!entry}
                                        >
                                            <Label className={styles.label()}>Registry Item</Label>
                                            <ComboBox.InputGroup className={styles.comboInputGroup()}>
                                                <Input
                                                    autoFocus={!entry}
                                                    placeholder="Select an item..."
                                                    className="bg-transparent border-none w-full h-full px-4 text-sm font-medium focus:ring-0"
                                                />
                                                {!entry && (
                                                    <ComboBox.Trigger className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-default-400 transition-colors">
                                                        <Icon icon="lucide:chevron-down" width={16} />
                                                    </ComboBox.Trigger>
                                                )}
                                            </ComboBox.InputGroup>
                                            <ComboBox.Popover className="bg-surface-base/95 backdrop-blur-md rounded-xl shadow-md overflow-hidden min-w-[300px] max-h-72 overflow-y-auto">
                                                <ListBox className="p-1">
                                                    {availableItems.map((item) => (
                                                        <ListBox.Item
                                                            key={item.id}
                                                            id={item.id}
                                                            textValue={item.name}
                                                            className="p-3 rounded-lg flex items-center justify-between group data-[selected=true]:bg-accent/10 data-[focused=true]:bg-default-100 transition-colors"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-foreground group-data-[selected=true]:text-accent">{item.name}</span>
                                                                <span className="t-mini text-default-400 font-mono tracking-tighter uppercase">{item.unitType}</span>
                                                            </div>
                                                            {rateItemId === item.id && (
                                                                <Icon icon="lucide:check" className="text-accent" width={16} />
                                                            )}
                                                        </ListBox.Item>
                                                    ))}
                                                </ListBox>
                                            </ComboBox.Popover>
                                        </ComboBox>

                                        {/* Rate Inputs - Standard HeroUI v3 InputGroup Style */}
                                        <div className="space-y-5">
                                            <NumberField
                                                isRequired
                                                minValue={0}
                                                value={costRate}
                                                onChange={setCostRate}
                                                className={styles.inputContainer()}
                                            >
                                                <Label className={styles.label()}>Cost Rate</Label>
                                                <InputGroup fullWidth>
                                                    <InputGroup.Prefix>
                                                        {getCurrencySymbol(card.currency)}
                                                    </InputGroup.Prefix>
                                                    <NumberField.Input
                                                        placeholder="0.00"
                                                        className="pl-0 pr-0"
                                                    />
                                                    <InputGroup.Suffix>
                                                        {card.currency}
                                                    </InputGroup.Suffix>
                                                </InputGroup>
                                                <Description className="t-mini leading-tight mt-1">
                                                    Internal payout to production
                                                </Description>
                                            </NumberField>

                                            <NumberField
                                                isRequired
                                                minValue={0}
                                                value={clientRate}
                                                onChange={setClientRate}
                                                className={styles.inputContainer()}
                                            >
                                                <Label className={styles.label()}>Client Rate</Label>
                                                <InputGroup fullWidth>
                                                    <InputGroup.Prefix>
                                                        {getCurrencySymbol(card.currency)}
                                                    </InputGroup.Prefix>
                                                    <NumberField.Input
                                                        placeholder="0.00"
                                                        className="pl-0 pr-0"
                                                    />
                                                    <InputGroup.Suffix>
                                                        {card.currency}
                                                    </InputGroup.Suffix>
                                                </InputGroup>
                                                <Description className="t-mini leading-tight mt-1">
                                                    Final billed amount to client
                                                </Description>
                                            </NumberField>

                                            {/* Financial Summary Strip - Technical Technical Style */}
                                            <Surface variant="secondary" className="flex items-center justify-between px-4 py-3 rounded-lg border border-default-100/50">
                                                <div className="flex flex-col">
                                                    <span className="t-micro font-black text-accent uppercase tracking-wider leading-none mb-0.5">Profit Margin</span>
                                                    <span className="t-mini text-default-400 font-medium">Net potential</span>
                                                </div>
                                                <div className={`text-xl font-bold font-mono tracking-tighter ${margin < MARGIN_DANGER_THRESHOLD ? 'text-danger' : 'text-success'}`}>
                                                    {margin > 0 ? '+' : ''}{margin.toFixed(1)}%
                                                </div>
                                            </Surface>
                                        </div>

                                        <Separator className="opacity-50" />

                                        {/* Operational Rules Section */}
                                        <Disclosure defaultExpanded={minQuantity > 0} className="group/disclosure space-y-4">
                                            <Disclosure.Heading>
                                                <Button
                                                    slot="trigger"
                                                    variant="ghost"
                                                    className="w-full h-10 px-2 justify-between hover:bg-default-100/50 transition-colors border-none"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${minQuantity > 0 ? "bg-warning/10 text-warning" : "bg-default-100 text-default-400"}`}>
                                                            <Icon icon="lucide:settings-2" width={16} />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">Operational Constraints</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {minQuantity > 0 && <span className="t-mini font-black text-warning uppercase">1 Active</span>}
                                                        <Disclosure.Indicator className="text-default-300" />
                                                    </div>
                                                </Button>
                                            </Disclosure.Heading>
                                            <Disclosure.Content>
                                                <Disclosure.Body className="space-y-4 pt-2">
                                                    <NumberField
                                                        minValue={0}
                                                        value={minQuantity}
                                                        onChange={setMinQuantity}
                                                        className={styles.inputContainer()}
                                                    >
                                                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                                                            <Label className={styles.label()}>
                                                                Minimum Units
                                                            </Label>
                                                        </div>
                                                        <NumberField.Group className="h-10 rounded-xl bg-surface-base border border-default-200/50 overflow-hidden flex shadow-sm focus-within:border-accent transition-all group/field">
                                                            <NumberField.DecrementButton className="px-3 border-r border-default-100 hover:bg-default-50 text-default-400 transition-colors" />
                                                            <NumberField.Input className="bg-transparent h-full w-full text-center font-bold font-mono text-sm focus:outline-none" />
                                                            <NumberField.IncrementButton className="px-3 border-l border-default-100 hover:bg-default-50 text-default-400 transition-colors" />
                                                        </NumberField.Group>
                                                        <p className="px-1 t-mini text-default-400 leading-tight font-medium italic">
                                                            Minimum billing quantity for this specific line item.
                                                        </p>
                                                    </NumberField>
                                                </Disclosure.Body>
                                            </Disclosure.Content>
                                        </Disclosure>
                                    </ScrollShadow>
                                </Modal.Body>

                                <Modal.Footer className={styles.footer()}>
                                    <Button
                                        variant="ghost"
                                        onPress={() => onOpenChange(false)}
                                        className="flex-1 h-12 rounded-xl font-bold text-default-500 hover:bg-default-100 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 rounded-xl font-bold bg-accent text-white shadow-accent-glow hover:bg-accent-600 active:scale-95 transition-all translate-z-0"
                                        isDisabled={!rateItemId}
                                    >
                                        {entry ? "Commit Changes" : "Create Entry"}
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Surface>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
