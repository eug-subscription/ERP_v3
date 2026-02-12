import {
    Button,
    Modal,
    TextField,
    Switch,
    Form,
    Label,
    Input,
    FieldError,
    Surface
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { ModifierReasonCode } from "../../../types/pricing";
import { mockModifierReasonCodes } from "../../../data/mock-modifier-reason-codes";
import { centeredModalStyles } from "../../../styles/modal-variants";

interface ModifierCodeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    codeRef?: ModifierReasonCode;
    onSuccess: (code: Partial<ModifierReasonCode>) => void;
    isPending?: boolean;
}

/**
 * ModifierCodeForm - Internal component to handle form state and submission.
 * Enforces uppercase code formatting and handles lifecycle resets.
 */
function ModifierCodeForm({
    codeRef,
    onSuccess,
    onOpenChange,
    isPending,
    styles
}: {
    codeRef?: ModifierReasonCode;
    onSuccess: (code: Partial<ModifierReasonCode>) => void;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    styles: ReturnType<typeof centeredModalStyles>;
}) {
    const [code, setCode] = useState(codeRef?.code || "");
    const [displayName, setDisplayName] = useState(codeRef?.displayName || "");
    const [active, setActive] = useState(codeRef?.active ?? true);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        onSuccess({
            ...(codeRef && { id: codeRef.id }),
            code: code.toUpperCase().trim(),
            displayName: displayName.trim(),
            active,
            status: codeRef?.status || 'active',
        });
    };

    const isEdit = !!codeRef;

    return (
        <Form onSubmit={handleSubmit}>
            <Modal.Body className={styles.body()}>
                {/* Contextual Help */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                    <Icon icon="lucide:info" className="size-4 shrink-0 text-accent mt-0.5" />
                    <p className="text-xs text-default-600 leading-relaxed">
                        Define reusable modifier reason codes. These codes will be available when configuring workflow blocks or processing orders.
                    </p>
                </div>

                {/* Reason Code Input */}
                <TextField
                    isRequired
                    value={code}
                    onChange={(val) => setCode(val.toUpperCase())}
                    isDisabled={isEdit}
                    validate={(value) => {
                        if (!value.trim()) return "Identification required";
                        if (!/^[A-Z0-9_]+$/.test(value)) return "Use UPPERCASE, numbers, or underscores";
                        const isDuplicate = mockModifierReasonCodes.some(
                            c => c.code === value && c.id !== codeRef?.id
                        );
                        if (isDuplicate) return "This code is already in the registry";
                        return null;
                    }}
                    className={styles.inputContainer()}
                >
                    <Label className={styles.label()}>Internal Code</Label>
                    <Input
                        autoFocus={!isEdit}
                        placeholder="e.g. WEEKEND_PREMIUM"
                        className={`${styles.input()} font-mono select-all`}
                    />
                    <FieldError className="text-xs text-danger mt-1.5 font-medium px-2" />
                </TextField>

                {/* Display Name Input */}
                <TextField
                    isRequired
                    value={displayName}
                    onChange={setDisplayName}
                    className={styles.inputContainer()}
                >
                    <Label className={styles.label()}>Display Name</Label>
                    <Input
                        autoFocus={isEdit}
                        placeholder="e.g. Weekend / Holiday Uplift"
                        className={styles.input()}
                    />
                    <FieldError className="text-xs text-danger mt-1.5 font-medium px-2" />
                </TextField>

                {/* Active Toggle */}
                <div className={styles.toggleContainer()}>
                    <div className="flex flex-col">
                        <span className="t-mini font-bold uppercase tracking-[0.15em] text-default-400">Registry Status</span>
                        <span className="text-tiny text-default-400 mt-1">Available for active operations</span>
                    </div>
                    <Switch
                        isSelected={active}
                        onChange={(isSelected: boolean) => setActive(isSelected)}
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch>
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
                    {isEdit ? "Commit Changes" : "Create Code"}
                </Button>
            </Modal.Footer>
        </Form>
    );
}

/**
 * ModifierCodeModal - Modal for creating or editing modifier reason codes.
 * Enforces uppercase code formatting and unique validation.
 */
export function ModifierCodeModal({ isOpen, onOpenChange, codeRef, onSuccess, isPending = false }: ModifierCodeModalProps) {


    const isEdit = !!codeRef;
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
                                    <Icon icon={isEdit ? "lucide:edit-3" : "lucide:badge-percent"} width={24} />
                                </div>
                                <div className="space-y-1">
                                    <Modal.Heading className="text-xl font-bold tracking-tight text-foreground">
                                        {isEdit ? "Refine Reason Code" : "New Reason Code"}
                                    </Modal.Heading>
                                    <p className={styles.headerDescription()}>
                                        {isEdit ? "Modify this price adjustment reason" : "Establish a new reason for modifiers"}
                                    </p>
                                </div>
                            </Modal.Header>

                            <ModifierCodeForm
                                key={`${isOpen}-${codeRef?.id || 'new'}`}
                                codeRef={codeRef}
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
