import { Accordion, InputGroup, TextField, Separator } from "@heroui/react";
import { Icon } from "@iconify/react";
import { CategoryAccordion } from "./CategoryAccordion";
import { useBlockLibrary } from "../../../../hooks/useBlockLibrary";
import { LIBRARY_PANEL_WIDTH } from "../constants";

export function BlockLibrary() {
    const {
        searchQuery,
        setSearchQuery,
        filteredCategories,
        getBlocksByCategory
    } = useBlockLibrary();

    return (
        <div
            className="flex h-full flex-col bg-surface relative"
            style={{ width: LIBRARY_PANEL_WIDTH }}
        >
            <div className="flex flex-col gap-4 p-4">
                <h2 className="text-large font-bold">Library</h2>
                <TextField aria-label="Search blocks">
                    <InputGroup>
                        <InputGroup.Prefix>
                            <Icon className="text-muted" icon="lucide:search" width={18} />
                        </InputGroup.Prefix>
                        <InputGroup.Input
                            placeholder="Search blocks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </InputGroup>
                </TextField>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4">
                {filteredCategories.length > 0 ? (
                    <Accordion
                        allowsMultipleExpanded
                        hideSeparator
                        className="px-0"
                        defaultExpandedKeys={["SETUP_ONBOARDING"]}
                    >
                        {filteredCategories.map((category) => (
                            <CategoryAccordion
                                key={category.id}
                                category={category}
                                blocks={getBlocksByCategory(category.id)}
                            />
                        ))}
                    </Accordion>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted">
                        <Icon icon="lucide:search-x" width={32} />
                        <span className="text-small">No matching blocks found</span>
                    </div>
                )}
            </div>
            <Separator orientation="vertical" className="absolute right-0 top-0 h-full" />
        </div>
    );
}
