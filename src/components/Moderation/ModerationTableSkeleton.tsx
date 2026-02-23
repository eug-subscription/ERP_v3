import { Skeleton } from "@heroui/react";
import { Table } from "../pricing/Table";

const SKELETON_ROW_COUNT = 5;

export function ModerationTableSkeleton() {
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
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <Table.Row key={i}>
                        <Table.Cell>
                            <Skeleton className="h-4 w-10 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-40 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-16 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-24 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-28 rounded-md" />
                                <Skeleton className="h-3 w-16 rounded-md" />
                            </div>
                        </Table.Cell>
                        <Table.Cell align="right">
                            <div className="flex items-center justify-end gap-1">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}
