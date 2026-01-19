import { TextField, Label, Input, Select, NumberField, Button, ListBox, TagGroup, Tag, ButtonGroup, FieldError } from "@heroui/react";
import { NewRateData, currencies, rateUnits } from "../../data/mock-project";

interface NewRetouchingRateFormProps {
    type: "ai" | "human";
    level: "standard" | "advanced" | "premium";
    clientRate: NewRateData;
    retoucherRate: NewRateData;
    onTypeChange: (type: "ai" | "human") => void;
    onLevelChange: (level: "standard" | "advanced" | "premium") => void;
    onClientRateChange: (field: keyof NewRateData, value: string | number) => void;
    onRetoucherRateChange: (field: keyof NewRateData, value: string | number) => void;
    onSubmit: () => void;
}

export function NewRetouchingRateForm({
    type,
    level,
    clientRate,
    retoucherRate,
    onTypeChange,
    onLevelChange,
    onClientRateChange,
    onRetoucherRateChange,
    onSubmit,
}: NewRetouchingRateFormProps) {
    return (
        <div className="flex flex-col gap-6 p-6 border border-divider rounded-xl bg-content1 shadow-sm">
            <div className="grid grid-cols-1 gap-6">
                {/* Rate Name */}
                <TextField
                    isRequired
                    value={clientRate.name}
                    onChange={(val) => {
                        onClientRateChange("name", val);
                        onRetoucherRateChange("name", val);
                    }}
                    className="w-full max-w-md"
                    validate={(val) => {
                        if (!val) return "Rate name is required";
                        if (val.length < 3) return "Name is too short";
                        return true;
                    }}
                >
                    <Label className="text-sm font-medium text-default-700 mb-1.5">
                        Rate Name
                    </Label>
                    <Input
                        placeholder="e.g. Standard Rate"
                        className="bg-content2 border-divider h-10 focus:border-accent"
                    />
                    <FieldError className="text-danger text-[10px] font-medium mt-1" />
                </TextField>

                {/* Type & Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold text-default-700">
                            Type
                        </Label>
                        <ButtonGroup fullWidth className="h-10">
                            <Button
                                variant={type === "ai" ? "primary" : "tertiary"}
                                onPress={() => onTypeChange("ai")}
                                className={type === "ai" ? "" : "border border-default-300"}
                            >
                                AI Retouching
                            </Button>
                            <Button
                                variant={type === "human" ? "primary" : "tertiary"}
                                onPress={() => onTypeChange("human")}
                                className={type === "human" ? "" : "border border-default-300"}
                            >
                                Human Retouching
                            </Button>
                        </ButtonGroup>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-sm font-semibold text-default-700">
                            Level
                        </Label>
                        <TagGroup
                            selectedKeys={[level]}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as "standard" | "advanced" | "premium";
                                if (val) onLevelChange(val);
                            }}
                            selectionMode="single"
                            className="w-full"
                        >
                            <TagGroup.List className="flex h-10 border border-default-300 rounded-lg gap-0 w-full relative">
                                <Tag
                                    id="standard"
                                    className="flex-1 rounded-l-[7px] rounded-r-none border-r border-default-300 h-full px-4 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:border-primary data-[selected=true]:border-1 data-[selected=true]:z-10 transition-all flex items-center justify-center cursor-pointer text-sm font-medium"
                                >
                                    Standard
                                </Tag>
                                <Tag
                                    id="advanced"
                                    className="flex-1 rounded-none border-r border-default-300 h-full px-4 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:border-primary data-[selected=true]:border-1 data-[selected=true]:z-10 transition-all flex items-center justify-center cursor-pointer text-sm font-medium"
                                >
                                    Advanced
                                </Tag>
                                <Tag
                                    id="premium"
                                    className="flex-1 rounded-r-[7px] rounded-l-none h-full px-4 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:border-primary data-[selected=true]:border-1 data-[selected=true]:z-10 transition-all flex items-center justify-center cursor-pointer text-sm font-medium"
                                >
                                    Premium
                                </Tag>
                            </TagGroup.List>
                        </TagGroup>
                    </div>
                </div>

                {/* Client Rate */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-default-700">
                        Client Rate <span className="text-danger">*</span>
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            isRequired
                            selectedKey={clientRate.currency}
                            onSelectionChange={(key) => onClientRateChange("currency", key as string)}
                            className="w-full"
                        >
                            <Label className="text-sm font-medium text-default-700 mb-1.5">
                                Currency
                            </Label>
                            <Select.Trigger className="bg-content2 border-divider h-10">
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
                            <FieldError className="text-danger text-[10px] font-medium mt-1" />
                        </Select>

                        <NumberField
                            isRequired
                            value={clientRate.amount}
                            onChange={(val) => onClientRateChange("amount", val ?? 1)}
                            className="w-full"
                            formatOptions={{ style: "currency", currency: clientRate.currency }}
                            minValue={0}
                            step={1}
                            validate={(val) => {
                                if (!val || val <= 0) return "Required";
                                return true;
                            }}
                        >
                            <Label className="text-sm font-medium text-default-700 mb-1.5">
                                Amount
                            </Label>
                            <NumberField.Group className="bg-content2 border-divider rounded-lg overflow-hidden flex items-center h-10">
                                <NumberField.DecrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums min-w-0" />
                                <NumberField.IncrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                            </NumberField.Group>
                            <div className="h-[22px]" />
                            <FieldError className="text-danger text-[10px] font-medium mt-1" />
                        </NumberField>

                        <Select
                            isRequired
                            selectedKey={clientRate.unit}
                            onSelectionChange={(key) => onClientRateChange("unit", key as string)}
                            className="w-full"
                        >
                            <Label className="text-sm font-medium text-default-700 mb-1.5">
                                Unit
                            </Label>
                            <Select.Trigger className="bg-content2 border-divider h-10">
                                <Select.Value />
                                <Select.Indicator />
                            </Select.Trigger>
                            <div className="h-[22px]" />
                            <Select.Popover>
                                <ListBox>
                                    {rateUnits.map((u) => (
                                        <ListBox.Item key={u} id={u} textValue={u}>{u}</ListBox.Item>
                                    ))}
                                </ListBox>
                            </Select.Popover>
                            <FieldError className="text-danger text-[10px] font-medium mt-1" />
                        </Select>
                    </div>
                </div>

                {/* Retoucher Rate (Only if Human) */}
                {type === "human" && (
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-semibold text-default-700">
                            Retoucher Rate <span className="text-danger">*</span>
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                isRequired
                                selectedKey={retoucherRate.currency}
                                onSelectionChange={(key) => onRetoucherRateChange("currency", key as string)}
                                className="w-full"
                            >
                                <Label className="text-sm font-medium text-default-700 mb-1.5">
                                    Currency
                                </Label>
                                <Select.Trigger className="bg-content2 border-divider h-10">
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
                                <FieldError className="text-danger text-[10px] font-medium mt-1" />
                            </Select>

                            <NumberField
                                isRequired
                                value={retoucherRate.amount}
                                onChange={(val) => onRetoucherRateChange("amount", val ?? 1)}
                                className="w-full"
                                formatOptions={{ style: "currency", currency: retoucherRate.currency }}
                                minValue={0}
                                step={1}
                                validate={(val) => {
                                    if (!val || val <= 0) return "Required";
                                    return true;
                                }}
                            >
                                <Label className="text-sm font-medium text-default-700 mb-1.5">
                                    Amount
                                </Label>
                                <NumberField.Group className="bg-content2 border-divider rounded-lg overflow-hidden flex items-center h-10">
                                    <NumberField.DecrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                    <NumberField.Input className="flex-1 bg-transparent px-1 text-sm tabular-nums min-w-0" />
                                    <NumberField.IncrementButton className="h-full px-1 hover:bg-content3 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity min-w-[32px]" />
                                </NumberField.Group>
                                <div className="h-[22px]" />
                                <FieldError className="text-danger text-[10px] font-medium mt-1" />
                            </NumberField>

                            <Select
                                isRequired
                                selectedKey={retoucherRate.unit}
                                onSelectionChange={(key) => onRetoucherRateChange("unit", key as string)}
                                className="w-full"
                            >
                                <Label className="text-sm font-medium text-default-700 mb-1.5">
                                    Unit
                                </Label>
                                <Select.Trigger className="bg-content2 border-divider h-10">
                                    <Select.Value />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <div className="h-[22px]" />
                                <Select.Popover>
                                    <ListBox>
                                        {rateUnits.map((u) => (
                                            <ListBox.Item key={u} id={u} textValue={u}>{u}</ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                                <FieldError className="text-danger text-[10px] font-medium mt-1" />
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-4">
                <Button
                    variant="primary"
                    onPress={onSubmit}
                    isDisabled={!clientRate.name}
                    className="shadow-accent-md"
                >
                    Create & Use Rate
                </Button>
            </div>
        </div>
    );
}
