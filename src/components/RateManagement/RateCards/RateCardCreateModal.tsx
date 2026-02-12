import {
    Button,
    Modal,
    TextField,
    ComboBox,
    ListBox,
    Form,
    Label,
    Input,
    FieldError,
    Surface
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { Currency, RateCard } from "../../../types/pricing";
import { getCurrencyFlagIcon } from "../../../utils/currency";
import { mockRateCards } from "../../../data/mock-rate-cards";
import { centeredModalStyles } from "../../../styles/modal-variants";
import { SUPPORTED_CURRENCIES } from "../../../constants/pricing-data";

interface RateCardCreateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (card: Partial<RateCard>) => void;
    isPending?: boolean;
}

/**
 * RateCardCreateModal - Modal for initializing a new Rate Card.
 * Implements Task 2.2.4 with validation and direct imports from @heroui/react.
 */
export function RateCardCreateModal({ isOpen, onOpenChange, onSuccess, isPending = false }: RateCardCreateModalProps) {
    const [name, setName] = useState("");
    const [currency, setCurrency] = useState<Currency>("EUR");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        onSuccess({
            name,
            currency,
            status: 'active',
            version: 1,
            entries: []
        });

        // Reset and close
        setName("");
        setCurrency("EUR");
        onOpenChange(false);
    };

    const styles = centeredModalStyles();

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop className="backdrop-blur-sm bg-black/20">
                <Modal.Container>
                    <Modal.Dialog className={styles.dialog()}>
                        <Surface className="w-full h-full bg-transparent">
                            <Modal.CloseTrigger className={styles.closeButton()}>
                                <Icon icon="lucide:x" width={16} className="text-default-500" />
                            </Modal.CloseTrigger>

                            <Modal.Header className={styles.header()}>
                                <div className={styles.iconWrapper()}>
                                    <Icon icon="lucide:file-plus-2" width={24} />
                                </div>
                                <div className="space-y-1">
                                    <Modal.Heading className="text-xl font-bold tracking-tight text-foreground">
                                        New Rate Card
                                    </Modal.Heading>
                                    <p className={styles.headerDescription()}>
                                        Create a baseline pricing catalog for a specific currency.
                                    </p>
                                </div>
                            </Modal.Header>

                            <Form key={`${isOpen}-new`} onSubmit={handleSubmit}>
                                <Modal.Body className={styles.body()}>
                                    <TextField
                                        isRequired
                                        value={name}
                                        onChange={setName}
                                        validate={(value) => {
                                            if (!value.trim()) return "Identification required";
                                            const isDuplicate = mockRateCards.some(
                                                rc => rc.name.toLowerCase() === value.toLowerCase() && rc.currency === currency
                                            );
                                            if (isDuplicate) return `A card with this name already exists for ${currency}`;
                                            return null;
                                        }}
                                        className={styles.inputContainer()}
                                    >
                                        <Label className={styles.label()}>Card Name</Label>
                                        <Input
                                            autoFocus
                                            placeholder="e.g. Agency Standard 2024"
                                            className={styles.input()}
                                        />
                                        <FieldError className="text-xs text-danger mt-1.5 font-medium px-2" />
                                    </TextField>

                                    <ComboBox
                                        isRequired
                                        selectedKey={currency}
                                        onSelectionChange={(key) => key && setCurrency(key as Currency)}
                                        className={styles.inputContainer()}
                                    >
                                        <Label className={styles.label()}>Currency</Label>
                                        <ComboBox.InputGroup className={styles.comboInputGroup()}>
                                            <Input
                                                className="w-full h-full bg-transparent border-none px-4 font-medium"
                                                placeholder="Search currency..."
                                            />
                                            <ComboBox.Trigger className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-default-400" />
                                        </ComboBox.InputGroup>
                                        <ComboBox.Popover
                                            placement="bottom"
                                            className="w-(--trigger-width) rounded-2xl border border-default-100/50 shadow-md backdrop-blur-xl bg-surface-base/95 max-h-72 overflow-y-auto"
                                        >
                                            <ListBox className="p-2 gap-1 text-left">
                                                {SUPPORTED_CURRENCIES.map((curr) => (
                                                    <ListBox.Item
                                                        key={curr.id}
                                                        id={curr.id}
                                                        textValue={curr.id}
                                                        className="rounded-lg h-10 data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent font-medium px-3 justify-start"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Icon icon={getCurrencyFlagIcon(curr.id)} width={18} />
                                                            <div className="flex flex-col items-start leading-none">
                                                                <span className="text-sm">{curr.id}</span>
                                                                <span className="t-mini opacity-60">{curr.label}</span>
                                                            </div>
                                                        </div>
                                                    </ListBox.Item>
                                                ))}
                                            </ListBox>
                                        </ComboBox.Popover>
                                    </ComboBox>
                                </Modal.Body>

                                <Modal.Footer className={styles.footer()}>
                                    <Button
                                        variant="ghost"
                                        onPress={() => onOpenChange(false)}
                                        className={styles.cancelButton()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className={styles.submitButton()}
                                        isPending={isPending}
                                    >
                                        Create Card
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
