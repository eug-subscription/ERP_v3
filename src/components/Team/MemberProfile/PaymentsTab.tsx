import { useState } from "react";
import {
    ComboBox,
    Input,
    Label,
    TextField,
    Select,
    ListBox,
    Button,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import { countries } from "../../../constants/countries";
import type {
    SplTeamMemberProfile,
    PaymentDetails,
} from "../../../types/team-profile";
import { FormSection } from "./FormSection";
import {
    FLEX_COL_GAP_4,
    TEXT_FIELD_LABEL,
    TEXT_SUBSECTION_LABEL,
} from "../../../constants/ui-tokens";

// ─── Static data ──────────────────────────────────────────────────────────────

const CURRENCIES: { id: string; label: string }[] = [
    { id: "GBP", label: "GBP — British Pound" },
    { id: "EUR", label: "EUR — Euro" },
    { id: "USD", label: "USD — US Dollar" },
    { id: "AED", label: "AED — UAE Dirham" },
    { id: "SGD", label: "SGD — Singapore Dollar" },
    { id: "AUD", label: "AUD — Australian Dollar" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PaymentsTabProps {
    profile: SplTeamMemberProfile;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PaymentsTab — "Payments" tab on the Member Profile page.
 *
 * Single FormSection with sub-sections:
 *  - Local Bank Details
 *  - International Bank Details
 *  - Billing Emails (list + Add another)
 *  - PayPal Accounts (list + Add another)
 *  - Billing Address
 */
export function PaymentsTab({ profile }: PaymentsTabProps) {
    const [payment, setPayment] = useState<PaymentDetails>(
        profile.paymentDetails,
    );
    const [isSaving, setIsSaving] = useState(false);

    const isDirty =
        JSON.stringify(payment) !== JSON.stringify(profile.paymentDetails);

    function handleCancel() {
        setPayment(profile.paymentDetails);
    }

    function handleSave() {
        setIsSaving(true);
        // TODO: trigger toast notification on successful save (deferred until real API integration)
        setTimeout(() => setIsSaving(false), 800);
    }

    // ── Billing email helpers ──────────────────────────────────────────────
    function updateEmail(index: number, value: string) {
        setPayment((p) => {
            const emails = [...p.billingEmails];
            emails[index] = value;
            return { ...p, billingEmails: emails };
        });
    }

    function addEmail() {
        setPayment((p) => ({
            ...p,
            billingEmails: [...p.billingEmails, ""],
        }));
    }

    // ── PayPal helpers ─────────────────────────────────────────────────────
    function updatePaypal(index: number, value: string) {
        setPayment((p) => {
            const accounts = [...p.paypalAccounts];
            accounts[index] = value;
            return { ...p, paypalAccounts: accounts };
        });
    }

    function addPaypal() {
        setPayment((p) => ({
            ...p,
            paypalAccounts: [...p.paypalAccounts, ""],
        }));
    }

    return (
        <div className={FLEX_COL_GAP_4}>
            <FormSection
                title="Payment method"
                description="Manage your bank accounts, billing email, and billing address."
                isDirty={isDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                isFirst
            >
                {/* ── Local Bank Details ──────────────────────────────── */}
                <p className={TEXT_SUBSECTION_LABEL}>
                    Local bank details
                </p>

                <ComboBox
                    selectedKey={payment.localBank.country}
                    onSelectionChange={(key: Key | null) =>
                        setPayment((p) => ({
                            ...p,
                            localBank: { ...p.localBank, country: (key ?? p.localBank.country) as string },
                        }))
                    }
                    className="w-full"
                >
                    <Label className={TEXT_FIELD_LABEL}>Country</Label>
                    <ComboBox.InputGroup>
                        <Input placeholder="Search country…" />
                        <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                        <ListBox>
                            {countries.map((c) => (
                                <ListBox.Item
                                    key={c.code}
                                    id={c.code}
                                    textValue={c.name}
                                >
                                    {c.name}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </ComboBox.Popover>
                </ComboBox>

                <TextField
                    fullWidth
                    name="localAccountHolderName"
                    value={payment.localBank.accountHolderName}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            localBank: { ...p.localBank, accountHolderName: v },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Account holder name</Label>
                    <Input placeholder="Jane Doe" />
                </TextField>

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        fullWidth
                        name="sortCode"
                        value={payment.localBank.sortCode}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                localBank: { ...p.localBank, sortCode: v },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Sort code</Label>
                        <Input placeholder="00-00-00" />
                    </TextField>

                    <TextField
                        fullWidth
                        name="accountNumber"
                        value={payment.localBank.accountNumber}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                localBank: { ...p.localBank, accountNumber: v },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Account number</Label>
                        <Input placeholder="12345678" />
                    </TextField>
                </div>

                {/* ── International Bank Details ────────────────────── */}
                <p className={`${TEXT_SUBSECTION_LABEL} pt-2`}>
                    International bank details
                </p>

                <ComboBox
                    selectedKey={payment.internationalBank.country}
                    onSelectionChange={(key: Key | null) =>
                        setPayment((p) => ({
                            ...p,
                            internationalBank: {
                                ...p.internationalBank,
                                country: (key ?? p.internationalBank.country) as string,
                            },
                        }))
                    }
                    className="w-full"
                >
                    <Label className={TEXT_FIELD_LABEL}>Country</Label>
                    <ComboBox.InputGroup>
                        <Input placeholder="Search country…" />
                        <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                        <ListBox>
                            {countries.map((c) => (
                                <ListBox.Item
                                    key={c.code}
                                    id={c.code}
                                    textValue={c.name}
                                >
                                    {c.name}
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </ComboBox.Popover>
                </ComboBox>

                <TextField
                    fullWidth
                    name="intlAccountHolderName"
                    value={payment.internationalBank.accountHolderName}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            internationalBank: {
                                ...p.internationalBank,
                                accountHolderName: v,
                            },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Account holder name</Label>
                    <Input placeholder="Jane Doe" />
                </TextField>

                <TextField
                    fullWidth
                    name="bankName"
                    value={payment.internationalBank.bankName}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            internationalBank: {
                                ...p.internationalBank,
                                bankName: v,
                            },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Bank name</Label>
                    <Input placeholder="Barclays" />
                </TextField>

                <TextField
                    fullWidth
                    name="iban"
                    value={payment.internationalBank.iban}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            internationalBank: {
                                ...p.internationalBank,
                                iban: v,
                            },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>IBAN</Label>
                    <Input placeholder="GB29 NWBK 6016 1331 9268 19" />
                </TextField>

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        fullWidth
                        name="swiftBic"
                        value={payment.internationalBank.swiftBic}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                internationalBank: {
                                    ...p.internationalBank,
                                    swiftBic: v,
                                },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>SWIFT / BIC</Label>
                        <Input placeholder="NWBKGB2L" />
                    </TextField>

                    <Select
                        selectedKey={payment.internationalBank.currency}
                        onSelectionChange={(key: Key | null) =>
                            setPayment((p) => ({
                                ...p,
                                internationalBank: {
                                    ...p.internationalBank,
                                    currency: (key ?? p.internationalBank.currency) as string,
                                },
                            }))
                        }
                        placeholder="Select currency"
                        className="w-full"
                    >
                        <Label className={TEXT_FIELD_LABEL}>Currency</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {CURRENCIES.map((c) => (
                                    <ListBox.Item
                                        key={c.id}
                                        id={c.id}
                                        textValue={c.label}
                                    >
                                        {c.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>

                {/* ── Billing Emails ───────────────────────────────── */}
                <p className={`${TEXT_SUBSECTION_LABEL} pt-2`}>
                    Billing email
                </p>

                <div className="flex flex-col gap-2">
                    {payment.billingEmails.map((email, index) => (
                        <TextField
                            key={index}
                            fullWidth
                            name={`billingEmail-${index}`}
                            type="email"
                            value={email}
                            onChange={(v) => updateEmail(index, v)}
                        >
                            <Input placeholder="billing@company.com" />
                        </TextField>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="self-start text-accent"
                        onPress={addEmail}
                    >
                        + Add another
                    </Button>
                </div>

                {/* ── PayPal Accounts ──────────────────────────────── */}
                <p className={`${TEXT_SUBSECTION_LABEL} pt-2`}>
                    PayPal account
                </p>

                <div className="flex flex-col gap-2">
                    {payment.paypalAccounts.map((account, index) => (
                        <TextField
                            key={index}
                            fullWidth
                            name={`paypal-${index}`}
                            type="email"
                            value={account}
                            onChange={(v) => updatePaypal(index, v)}
                        >
                            <Input placeholder="paypal@example.com" />
                        </TextField>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="self-start text-accent"
                        onPress={addPaypal}
                    >
                        + Add another
                    </Button>
                </div>

                {/* ── Billing Address ──────────────────────────────── */}
                <p className={`${TEXT_SUBSECTION_LABEL} pt-2`}>
                    Billing address
                </p>

                <TextField
                    fullWidth
                    name="addressLine1"
                    value={payment.billingAddress.addressLine1}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            billingAddress: { ...p.billingAddress, addressLine1: v },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Address line 1</Label>
                    <Input placeholder="123 Main Street" />
                </TextField>

                <TextField
                    fullWidth
                    name="addressLine2"
                    value={payment.billingAddress.addressLine2}
                    onChange={(v) =>
                        setPayment((p) => ({
                            ...p,
                            billingAddress: { ...p.billingAddress, addressLine2: v },
                        }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Address line 2 (optional)</Label>
                    <Input placeholder="Apartment, suite, unit, building…" />
                </TextField>

                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        fullWidth
                        name="city"
                        value={payment.billingAddress.city}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                billingAddress: { ...p.billingAddress, city: v },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>City</Label>
                        <Input placeholder="London" />
                    </TextField>

                    <TextField
                        fullWidth
                        name="stateRegion"
                        value={payment.billingAddress.stateRegion}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                billingAddress: { ...p.billingAddress, stateRegion: v },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>County / Region / State</Label>
                        <Input placeholder="Greater London" />
                    </TextField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ComboBox
                        selectedKey={payment.billingAddress.country}
                        onSelectionChange={(key: Key | null) =>
                            setPayment((p) => ({
                                ...p,
                                billingAddress: {
                                    ...p.billingAddress,
                                    country: (key ?? p.billingAddress.country) as string,
                                },
                            }))
                        }
                        className="w-full"
                    >
                        <Label className={TEXT_FIELD_LABEL}>Country</Label>
                        <ComboBox.InputGroup>
                            <Input placeholder="Search country…" />
                            <ComboBox.Trigger />
                        </ComboBox.InputGroup>
                        <ComboBox.Popover>
                            <ListBox>
                                {countries.map((c) => (
                                    <ListBox.Item
                                        key={c.code}
                                        id={c.code}
                                        textValue={c.name}
                                    >
                                        {c.name}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </ComboBox.Popover>
                    </ComboBox>

                    <TextField
                        fullWidth
                        name="postcode"
                        value={payment.billingAddress.postcode}
                        onChange={(v) =>
                            setPayment((p) => ({
                                ...p,
                                billingAddress: { ...p.billingAddress, postcode: v },
                            }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Postcode / ZIP</Label>
                        <Input placeholder="SW1A 1AA" />
                    </TextField>
                </div>
            </FormSection>
        </div>
    );
}
