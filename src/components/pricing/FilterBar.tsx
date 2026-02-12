import { SearchField, Tabs, Surface } from "@heroui/react";

interface FilterBarProps<T extends string = string> {
    search?: {
        value: string;
        onChange: (val: string) => void;
        placeholder?: string;
    };
    status?: {
        value: T | 'all';
        onChange: (val: T | 'all') => void;
        options: { key: T | 'all'; label: string }[];
    };
    currency?: {
        value: string;
        onChange: (val: string) => void;
        options: { key: string; label: string }[];
    };
}

export function FilterBar<T extends string = string>({ search, status, currency }: FilterBarProps<T>) {
    return (
        <Surface
            variant="secondary"
            className="flex flex-col md:flex-row items-center justify-between gap-4 p-1.5 rounded-full shadow-sm bg-default-100/40 backdrop-blur-sm border-none w-full"
        >
            {search && (
                <div className="flex-1 w-full md:max-w-xl pl-2">
                    <SearchField
                        value={search.value}
                        onChange={search.onChange}
                        aria-label="Search catalog"
                        className="w-full group"
                    >
                        <SearchField.Group className="bg-surface-base dark:bg-default-100 border-none rounded-full h-10 shadow-sm focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                            <SearchField.SearchIcon className="ml-4 text-default-400 group-focus-within:text-accent transition-colors size-4" />
                            <SearchField.Input
                                placeholder={search.placeholder || "Search..."}
                                className="text-sm font-medium placeholder:text-default-400 ml-1"
                            />
                            <SearchField.ClearButton className="mr-2" />
                        </SearchField.Group>
                    </SearchField>
                </div>
            )}

            {status && (
                <div className="flex-shrink-0 pr-1.5">
                    <Tabs
                        selectedKey={status.value}
                        onSelectionChange={(key) => status.onChange(key as T | 'all')}
                        className="w-fit"
                    >
                        <Tabs.ListContainer>
                            <Tabs.List
                                aria-label="Status filters"
                                className="bg-default-200/50 dark:bg-default-100/80 p-1 rounded-full flex items-center gap-1"
                            >
                                {status.options.map((opt) => (
                                    <Tabs.Tab
                                        key={opt.key}
                                        id={opt.key}
                                        className="h-8 px-5 rounded-full text-xs font-semibold data-[selected=true]:text-foreground text-default-500 transition-colors whitespace-nowrap relative"
                                    >
                                        {opt.label}
                                        <Tabs.Indicator className="bg-surface-base dark:bg-default-200 rounded-full shadow-sm" />
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                        </Tabs.ListContainer>
                    </Tabs>
                </div>
            )}

            {currency && (
                <div className="flex-shrink-0 pr-1.5">
                    <Tabs
                        selectedKey={currency.value}
                        onSelectionChange={(key) => currency.onChange(key as string)}
                        className="w-fit"
                    >
                        <Tabs.ListContainer>
                            <Tabs.List
                                aria-label="Currency filters"
                                className="bg-default-200/50 dark:bg-default-100/80 p-1 rounded-full flex items-center gap-1"
                            >
                                {currency.options.map((opt) => (
                                    <Tabs.Tab
                                        key={opt.key}
                                        id={opt.key}
                                        className="h-8 px-5 rounded-full text-xs font-semibold data-[selected=true]:text-foreground text-default-500 transition-colors whitespace-nowrap relative"
                                    >
                                        {opt.label}
                                        <Tabs.Indicator className="bg-surface-base dark:bg-default-200 rounded-full shadow-sm" />
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                        </Tabs.ListContainer>
                    </Tabs>
                </div>
            )}
        </Surface>
    );
}
