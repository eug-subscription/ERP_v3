import { Button, Tooltip, Avatar, Chip, Dropdown, Label } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Table } from "./pricing/Table";
import { PhotoData } from "../data/mock-photos";
import { TOOLTIP_DELAY, FILE_NAME_MAX_WIDTH } from "../constants/ui-tokens";

function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function parseDateTime(dateTimeStr: string): { date: string; time: string } {
    const separatorIndex = dateTimeStr.lastIndexOf(", ");
    if (separatorIndex === -1) return { date: dateTimeStr, time: "" };
    return {
        date: dateTimeStr.slice(0, separatorIndex),
        time: dateTimeStr.slice(separatorIndex + 2),
    };
}

interface PhotoRowProps {
    photo: PhotoData;
}

export function PhotoRow({ photo }: PhotoRowProps) {
    // TODO: implement download handler when API is available
    const handleDownload = () => { };
    const { date, time } = parseDateTime(photo.createdAt);

    return (
        <Table.Row>
            <Table.Cell>
                <Tooltip delay={TOOLTIP_DELAY}>
                    <Tooltip.Trigger>
                        <Button
                            variant="ghost"
                            onPress={handleDownload}
                            className={`p-0 h-auto min-w-0 text-accent hover:underline text-left font-bold t-compact ${FILE_NAME_MAX_WIDTH} truncate block bg-transparent`}
                        >
                            {photo.fileName}
                        </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>{photo.fileName}</Tooltip.Content>
                </Tooltip>
            </Table.Cell>
            <Table.Cell>
                <Chip
                    color={photo.source === "API" ? "accent" : "default"}
                    variant="soft"
                    size="sm"

                >
                    {photo.source}
                </Chip>
            </Table.Cell>
            <Table.Cell>
                <div className="flex items-center gap-2">
                    <Avatar size="sm">
                        <Avatar.Image src={photo.createdBy.avatar} alt={photo.createdBy.name} />
                        <Avatar.Fallback>{getInitials(photo.createdBy.name)}</Avatar.Fallback>
                    </Avatar>
                    <span className="text-sm font-medium text-default-900">
                        {photo.createdBy.name}
                    </span>
                </div>
            </Table.Cell>
            <Table.Cell>
                <span className="font-medium text-default-600 t-compact whitespace-nowrap">{photo.size}</span>
            </Table.Cell>
            <Table.Cell>
                {photo.downloadedBy.avatar ? (
                    <div className="flex items-center gap-2">
                        <Avatar size="sm">
                            <Avatar.Image
                                src={photo.downloadedBy.avatar}
                                alt={photo.downloadedBy.name}
                            />
                            <Avatar.Fallback>{getInitials(photo.downloadedBy.name)}</Avatar.Fallback>
                        </Avatar>
                        <span className="text-sm font-medium text-default-900">
                            {photo.downloadedBy.name}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-default-400 font-medium">Not downloaded</span>
                )}
            </Table.Cell>
            <Table.Cell>
                <Chip
                    color={
                        photo.status === "Completed"
                            ? "accent"
                            : photo.status === "Available"
                                ? "success"
                                : photo.status === "In process"
                                    ? "warning"
                                    : "default"
                    }
                    size="sm"
                    variant="soft"
                >
                    <div className="flex items-center gap-1.5">
                        <Icon
                            icon={
                                photo.status === "Completed"
                                    ? "lucide:check-circle"
                                    : photo.status === "Available"
                                        ? "lucide:check"
                                        : "lucide:clock"
                            }
                            className="w-3.5 h-3.5"
                        />
                        {photo.status}
                    </div>
                </Chip>
            </Table.Cell>
            <Table.Cell align="right">
                <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium text-default-700 whitespace-nowrap">
                        {date}
                    </span>
                    <span className="t-micro font-normal text-default-400 whitespace-nowrap">
                        {time}
                    </span>
                </div>
            </Table.Cell>
            <Table.Cell align="right">
                <Dropdown>
                    <Dropdown.Trigger
                        aria-label="Actions"
                        className="button button-sm button--ghost button--icon-only rounded-full bg-default-100/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500"
                    >
                        <Icon icon="lucide:ellipsis-vertical" className="w-4 h-4" />
                    </Dropdown.Trigger>
                    <Dropdown.Popover>
                        <Dropdown.Menu onAction={(key) => key === "download" ? handleDownload() : undefined}>
                            <Dropdown.Item id="download" textValue="Download">
                                <Icon icon="lucide:download" className="w-4 h-4 text-accent" />
                                <Label>Download</Label>
                            </Dropdown.Item>
                            <Dropdown.Item id="preview" textValue="Preview">
                                <Icon icon="lucide:eye" className="w-4 h-4 text-default-500" />
                                <Label>Preview</Label>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </Table.Cell>
        </Table.Row>
    );
}
