import { useState, useMemo } from "react";
import {
    Select,
    Label,
    ListBox,
    Button,
    Chip,
    Separator,
    SearchField,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Rate } from "../../data/mock-project";

interface RateSelectProps {
    label?: string;
    rates: Rate[];
    selectedRateId?: string;
    onRateChange: (rateId: string) => void;
    onCreateNew: () => void;
    isRequired?: boolean;
}

export function RateSelect({
    label,
    rates,
    selectedRateId,
    onRateChange,
    onCreateNew,
    isRequired,
}: RateSelectProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const selectedKey = selectedRateId ? selectedRateId : null;

    const filteredRates = useMemo(() => {
        if (!searchQuery) return rates;
        const query = searchQuery.toLowerCase();
        return rates.filter(rate =>
            rate.name.toLowerCase().includes(query) ||
            rate.unit.toLowerCase().includes(query) ||
            rate.currency.toLowerCase().includes(query) ||
            rate.amount.toString().includes(query)
        );
    }, [rates, searchQuery]);

    return (
        <div className="w-full">
            <Select
                selectedKey={selectedKey}
                onSelectionChange={(key) => {
                    if (key) onRateChange(key as string);
                }}
                onOpenChange={(isOpen) => {
                    if (!isOpen) setSearchQuery("");
                }}
                isRequired={isRequired}
                className="w-full"
            >
                {label && <Label className="text-sm font-medium">{label}</Label>}
                <Select.Trigger className="bg-field border-divider hover:border-accent transition-colors min-h-12 h-auto py-2">
                    <Select.Value>
                        {(() => {
                            const selectedRate = rates.find(r => r.id === selectedRateId);
                            if (selectedRate) {
                                return (
                                    <div className="flex items-center justify-between w-full pr-2 h-10">
                                        <div className="flex items-baseline gap-2 min-w-0">
                                            <span className="text-sm font-semibold text-foreground truncate">
                                                {selectedRate.name}
                                            </span>
                                            <span className="text-xs text-default-400 whitespace-nowrap lowercase">
                                                {selectedRate.unit}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-default-700 ml-auto mr-4">
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: selectedRate.currency,
                                            }).format(selectedRate.amount)}
                                        </span>
                                    </div>
                                );
                            }
                            return (
                                <div className="flex items-center h-10">
                                    <span className="text-default-500 text-sm translate-y-[-1px]">Select a rate</span>
                                </div>
                            );
                        })()}
                    </Select.Value>
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="p-0 overflow-hidden">
                    <div className="p-3 pb-2 border-b border-divider bg-surface/50 sticky top-0 z-10 backdrop-blur-sm">
                        <SearchField
                            value={searchQuery}
                            onChange={setSearchQuery}
                            autoFocus
                            className="w-full"
                            aria-label="Search rates"
                        >
                            <SearchField.Group className="bg-field">
                                <SearchField.SearchIcon />
                                <SearchField.Input
                                    placeholder="Search rates..."
                                    className="h-9"
                                />
                                <SearchField.ClearButton />
                            </SearchField.Group>
                        </SearchField>
                    </div>
                    <ListBox
                        items={filteredRates}
                        className="px-1 py-1"
                        renderEmptyState={() => (
                            <div className="flex flex-col items-center justify-center p-6 gap-2 text-default-400">
                                <Icon icon="lucide:search-x" width={32} />
                                <div className="text-small font-medium">No rates found</div>
                                <div className="text-tiny">Try creating a new custom rate instead.</div>
                            </div>
                        )}
                    >
                        {(rate) => (
                            <ListBox.Item
                                id={rate.id}
                                textValue={rate.name}
                                className="px-2 py-2 rounded-lg relative"
                            >
                                <div className="flex justify-between items-center w-full gap-4">
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-medium truncate text-sm">{rate.name}</span>
                                            {rate.isDefault && (
                                                <Chip color="accent" variant="primary" size="sm" className="h-5 t-mini px-1.5">
                                                    Default
                                                </Chip>
                                            )}
                                            {rate.lastUsed && (
                                                <Chip color="default" variant="tertiary" size="sm" className="h-5 t-mini px-1.5">
                                                    Last used
                                                </Chip>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="t-mini text-default-500 uppercase font-bold tracking-tight">
                                                {rate.unit}
                                            </span>
                                            <span className="t-mini text-default-400">
                                                Created on {new Intl.DateTimeFormat("en-GB", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                }).format(new Date(rate.createdDate))}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                            {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency: rate.currency,
                                            }).format(rate.amount)}
                                        </span>
                                        <ListBox.ItemIndicator>
                                            <Icon icon="lucide:check" className="text-primary" width={16} />
                                        </ListBox.ItemIndicator>
                                    </div>
                                </div>
                            </ListBox.Item>
                        )}
                    </ListBox>
                    <Separator className="my-1" />
                    <div className="p-3 pt-0 pb-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-primary border-none shadow-none hover:bg-primary/10 px-2"
                            onPress={onCreateNew}
                        >
                            <Icon icon="lucide:plus" className="mr-2" />
                            Create new rate
                        </Button>
                    </div>
                </Select.Popover>
            </Select>
        </div>
    );
}
