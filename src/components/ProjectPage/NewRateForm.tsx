import { TextField, Label, Input, Select, NumberField, Button, ListBox, FieldError, Description } from "@heroui/react";
import { NewRateData, currencies, rateUnits } from "../../data/mock-project";

interface NewRateFormProps {
    rateType: "client" | "provider";
    value: NewRateData;
    onChange: (field: keyof NewRateData, value: string | number) => void;
    onSubmit: () => void;
    onCancel?: () => void;
    label: string;
    isEditing?: boolean;
}

export function NewRateForm({ value, onChange, onSubmit, onCancel, label, isEditing = false }: NewRateFormProps) {
    return (
        <div className="flex flex-col gap-4 p-4 border border-divider rounded-xl bg-surface/50 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-6">
                <div className="md:col-span-12 lg:col-span-5">
                    <TextField
                        isRequired
                        value={value.name}
                        onChange={(val) => onChange("name", val)}
                        className="w-full"
                        validate={(val) => {
                            if (!val) return "Name is required";
                            if (val.length < 3) return "Name is too short (min 3 chars)";
                            if (val.length > 40) return "Name is too long (max 40 chars)";
                            return true;
                        }}
                    >
                        <Label className="text-sm font-medium text-default-700 mb-1.5">
                            {label}
                        </Label>
                        <Input
                            placeholder="e.g. Standard Rate"
                            className="bg-field border-divider h-10 focus:border-accent"
                        />
                        <div className="flex justify-between mt-1 inline-flex w-full">
                            <Description className="t-mini text-default-400">Visible to your team</Description>
                            <span className="t-mini text-default-400">{value.name.length}/40</span>
                        </div>
                        <FieldError className="text-danger t-mini font-medium mt-1" />
                    </TextField>
                </div>

                <div className="md:col-span-4 lg:col-span-2">
                    <Select
                        isRequired
                        selectedKey={value.currency}
                        onSelectionChange={(key) => onChange("currency", key as string)}
                        className="w-full"
                    >
                        <Label className="text-sm font-medium text-default-700 mb-1.5">
                            Currency
                        </Label>
                        <Select.Trigger className="bg-field border-divider h-10">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <div className="h-[22px]" />
                        <Select.Popover>
                            <ListBox>
                                {currencies.map((c) => (
                                    <ListBox.Item key={c.id} id={c.id} textValue={c.id}>
                                        <div className="flex items-center gap-2">
                                            <span className="w-4 text-center font-medium text-default-500">{c.symbol}</span>
                                            <span>{c.id}</span>
                                        </div>
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                        <FieldError className="text-danger t-mini font-medium mt-1" />
                    </Select>
                </div>

                <div className="md:col-span-4 lg:col-span-3">
                    <NumberField
                        isRequired
                        value={value.amount}
                        onChange={(val) => onChange("amount", val ?? 1)}
                        minValue={0}
                        step={1}
                        formatOptions={{
                            style: "currency",
                            currency: value.currency,
                        }}
                        className="w-full"
                        validate={(val) => {
                            if (!val || val <= 0) return "Amount must be greater than 0";
                            return true;
                        }}
                    >
                        <Label className="text-sm font-medium text-default-700 mb-1.5">
                            Amount
                        </Label>
                        <NumberField.Group className="bg-field border-divider rounded-lg overflow-hidden flex items-center h-10">
                            <NumberField.DecrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums min-w-0" />
                            <NumberField.IncrementButton className="h-full px-1 hover:bg-field-hover flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                        </NumberField.Group>
                        <div className="h-[22px]" />
                        <FieldError className="text-danger t-mini font-medium mt-1" />
                    </NumberField>
                </div>

                <div className="md:col-span-4 lg:col-span-2">
                    <Select
                        isRequired
                        selectedKey={value.unit}
                        onSelectionChange={(key) => onChange("unit", key as string)}
                        className="w-full"
                    >
                        <Label className="text-sm font-medium text-default-700 mb-1.5">
                            Unit
                        </Label>
                        <Select.Trigger className="bg-field border-divider h-10">
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <div className="h-[22px]" />
                        <Select.Popover>
                            <ListBox>
                                {rateUnits.map((u) => (
                                    <ListBox.Item key={u} id={u} textValue={u}>
                                        {u}
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                        <FieldError className="text-danger t-mini font-medium mt-1" />
                    </Select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {isEditing && onCancel && (
                    <Button
                        variant="secondary"
                        onPress={onCancel}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    variant="primary"
                    onPress={onSubmit}
                    isDisabled={!value.name}
                    className="shadow-accent-md"
                >
                    {isEditing ? "Save Changes" : "Create Rate"}
                </Button>
            </div>
        </div>
    );
}

