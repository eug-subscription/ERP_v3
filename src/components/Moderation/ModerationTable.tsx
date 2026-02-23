import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Table } from "../pricing/Table";
import { formatRelativeTime, formatAbsoluteTime } from "../../utils/format-time";
import { TOOLTIP_DELAY, ACTION_BUTTON_ICON } from "../../constants/ui-tokens";
import type { ModerationEntry } from "../../types/moderation";

interface ModerationTableProps {
    entries: ModerationEntry[];
}

export function ModerationTable({ entries }: ModerationTableProps) {
    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column isBlack>Id</Table.Column>
                    <Table.Column isBlack>Stage</Table.Column>
                    <Table.Column>Number of Input Files</Table.Column>
                    <Table.Column>Approved / Rejected</Table.Column>
                    <Table.Column>Date</Table.Column>
                    <Table.Column>User</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {entries.map((entry) => (
                    <Table.Row key={entry.id}>
                        <Table.Cell>
                            <span className="font-mono text-sm text-default-500">{entry.id}</span>
                        </Table.Cell>
                        <Table.Cell>
                            <span className="text-sm font-medium text-default-900">{entry.stage}</span>
                        </Table.Cell>
                        <Table.Cell>
                            <span className="text-sm font-medium text-default-900">
                                {entry.inputFileCount}
                                {entry.batchLabel && (
                                    <span className="text-default-400"> [{entry.batchLabel}]</span>
                                )}
                            </span>
                        </Table.Cell>
                        <Table.Cell>
                            <span className="text-sm font-medium">
                                <span className="text-success">{entry.approved}</span>
                                <span className="text-default-400 mx-1">/</span>
                                <span className={entry.rejected > 0 ? "text-danger" : "text-default-400"}>
                                    {entry.rejected}
                                </span>
                            </span>
                        </Table.Cell>
                        <Table.Cell>
                            <Tooltip delay={TOOLTIP_DELAY}>
                                <Tooltip.Trigger>
                                    <span className="text-xs font-medium text-default-500 whitespace-nowrap cursor-default">
                                        {formatRelativeTime(entry.date)}
                                    </span>
                                </Tooltip.Trigger>
                                <Tooltip.Content>{formatAbsoluteTime(entry.date)}</Tooltip.Content>
                            </Tooltip>
                        </Table.Cell>
                        <Table.Cell>
                            <div>
                                <div className="text-sm font-medium text-default-900">{entry.userName}</div>
                                <div className="text-xs text-default-400 font-normal">{entry.userRole}</div>
                            </div>
                        </Table.Cell>
                        <Table.Cell align="right">
                            <div className="flex items-center justify-end gap-1">
                                <Tooltip delay={TOOLTIP_DELAY}>
                                    <Tooltip.Trigger>
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            className={ACTION_BUTTON_ICON}
                                            // TODO: navigate to moderation entry detail view
                                            onPress={() => { }}
                                        >
                                            <Icon icon="lucide:eye" className="w-4 h-4" />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>View Details</Tooltip.Content>
                                </Tooltip>
                                <Tooltip delay={TOOLTIP_DELAY}>
                                    <Tooltip.Trigger>
                                        <Button
                                            isIconOnly
                                            variant="ghost"
                                            size="sm"
                                            className={ACTION_BUTTON_ICON}
                                            // TODO: return entry to moderation queue
                                            onPress={() => { }}
                                        >
                                            <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
                                        </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>Return to Moderation</Tooltip.Content>
                                </Tooltip>
                            </div>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}
