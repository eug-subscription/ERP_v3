import { ComboBox, Input, Label, ListBox } from "@heroui/react";
import type { Key } from "@heroui/react";
import { TEAM_ROLES } from "../../types/team";
import type { TeamMemberFilters } from "../../hooks/useTeamMembers";
import type { TeamRole } from "../../types/team";
import { FILTER_SELECT_WIDTH } from "../../constants/ui-tokens";

interface TeamFiltersProps {
    filters: TeamMemberFilters;
    onFiltersChange: (filters: TeamMemberFilters) => void;
    countryOptions: string[];
    cityOptions: string[];
}

export function TeamFilters({ filters, onFiltersChange, countryOptions, cityOptions }: TeamFiltersProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            {/* Role combobox */}
            <ComboBox
                className={FILTER_SELECT_WIDTH}
                selectedKey={filters.role || null}
                onSelectionChange={(key: Key | null) => {
                    onFiltersChange({ ...filters, role: (key as TeamRole) ?? "" });
                }}
                menuTrigger="focus"
            >
                <Label>Role</Label>
                <ComboBox.InputGroup>
                    <Input placeholder="All roles" />
                    <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover className="w-(--trigger-width)">
                    <ListBox className="p-1 max-h-[260px] overflow-y-auto">
                        <ListBox.Item id="" textValue="All roles">
                            <Label>All roles</Label>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                        {TEAM_ROLES.map((role) => (
                            <ListBox.Item key={role.id} id={role.id} textValue={role.label}>
                                <Label>{role.label}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>

            {/* Country combobox */}
            <ComboBox
                className={FILTER_SELECT_WIDTH}
                selectedKey={filters.country || null}
                onSelectionChange={(key: Key | null) => {
                    onFiltersChange({ ...filters, country: (key as string) ?? "" });
                }}
                menuTrigger="focus"
            >
                <Label>Country</Label>
                <ComboBox.InputGroup>
                    <Input placeholder="All countries" />
                    <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover className="w-(--trigger-width)">
                    <ListBox className="p-1 max-h-[260px] overflow-y-auto">
                        <ListBox.Item id="" textValue="All countries">
                            <Label>All countries</Label>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                        {countryOptions.map((country) => (
                            <ListBox.Item key={country} id={country} textValue={country}>
                                <Label>{country}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>

            {/* City combobox */}
            <ComboBox
                className={FILTER_SELECT_WIDTH}
                selectedKey={filters.city || null}
                onSelectionChange={(key: Key | null) => {
                    onFiltersChange({ ...filters, city: (key as string) ?? "" });
                }}
                menuTrigger="focus"
            >
                <Label>City</Label>
                <ComboBox.InputGroup>
                    <Input placeholder="All cities" />
                    <ComboBox.Trigger />
                </ComboBox.InputGroup>
                <ComboBox.Popover className="w-(--trigger-width)">
                    <ListBox className="p-1 max-h-[260px] overflow-y-auto">
                        <ListBox.Item id="" textValue="All cities">
                            <Label>All cities</Label>
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                        {cityOptions.map((city) => (
                            <ListBox.Item key={city} id={city} textValue={city}>
                                <Label>{city}</Label>
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </ComboBox.Popover>
            </ComboBox>
        </div>
    );
}
