import { Table } from "./pricing/Table";
import { EmptyState } from "./pricing/EmptyState";
import { UploadFileRow } from "./UploadFileRow";
import { UploadFile } from "../data/mock-upload";

interface UploadFileTableProps {
    files: UploadFile[];
    activeTab: string;
    onClearFilter: () => void;
    onPauseFile?: (id: string) => void;
    onCancelFile?: (id: string) => void;
}

export function UploadFileTable({
    files,
    activeTab,
    onClearFilter,
    onPauseFile,
    onCancelFile,
}: UploadFileTableProps) {
    if (files.length === 0) {
        return (
            <EmptyState
                icon="lucide:filter-x"
                title="No matching files"
                description={`No files match the "${activeTab}" filter. Clear the filter to see all files.`}
                actionLabel="Clear Filter"
                actionIcon="lucide:x"
                onAction={onClearFilter}
            />
        );
    }

    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column isBlack>File Name</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Progress</Table.Column>
                    <Table.Column>Size</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {files.map((file) => (
                    <UploadFileRow
                        key={file.id}
                        file={file}
                        onPause={onPauseFile}
                        onCancel={onCancelFile}
                    />
                ))}
            </Table.Body>
        </Table>
    );
}
