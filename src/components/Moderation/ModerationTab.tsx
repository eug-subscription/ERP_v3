import { useState } from "react";
import { Alert, Tabs } from "@heroui/react";
import { useModerationEntries } from "../../hooks/useModerationEntries";
import { ModerationTable } from "./ModerationTable";
import { ModerationTableSkeleton } from "./ModerationTableSkeleton";
import { EmptyState } from "../pricing/EmptyState";
import { TEXT_TAB_HEADING } from "../../constants/ui-tokens";

type RoleFilter = "all" | "Moderator" | "Client";

export function ModerationTab() {
    const { data: entries, isLoading, error } = useModerationEntries();
    const [filter, setFilter] = useState<RoleFilter>("all");

    const filteredEntries = entries?.filter((entry) =>
        filter === "all" ? true : entry.userRole === filter
    ) ?? [];

    return (
        <div className="pb-4">
            <header className="mb-6">
                <h2 className={TEXT_TAB_HEADING}>
                    Moderation
                </h2>
                <p className="text-sm font-medium text-default-500 mt-1">
                    Track progress, moderate submissions, and view order statistics.
                </p>
            </header>

            <div className="mb-6">
                <Tabs
                    selectedKey={filter}
                    onSelectionChange={(key) => setFilter(key as RoleFilter)}
                    aria-label="Moderation filter"
                >
                    <Tabs.ListContainer>
                        <Tabs.List>
                            <Tabs.Tab id="all">
                                All
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="Moderator">
                                <Tabs.Separator />
                                Moderators
                                <Tabs.Indicator />
                            </Tabs.Tab>
                            <Tabs.Tab id="Client">
                                <Tabs.Separator />
                                Clients
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs.ListContainer>
                </Tabs>
            </div>

            {isLoading ? (
                <ModerationTableSkeleton />
            ) : error ? (
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            Failed to load moderation entries. Please try again later.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            ) : filteredEntries.length === 0 ? (
                <EmptyState
                    icon="lucide:shield-check"
                    title="No moderation entries"
                    description="No entries match the selected filter."
                />
            ) : (
                <ModerationTable entries={filteredEntries} />
            )}
        </div>
    );
}
