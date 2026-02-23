import { Skeleton } from "@heroui/react";
import { Table } from "../pricing/Table";

const SKELETON_ROW_COUNT = 5;

export function ShotListTableSkeleton() {
    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column className="w-10">
                        <Skeleton className="h-4 w-4 rounded" />
                    </Table.Column>
                    <Table.Column>Image</Table.Column>
                    <Table.Column isBlack>ID</Table.Column>
                    <Table.Column isBlack>Name</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Creator</Table.Column>
                    <Table.Column>Created at</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <Table.Row key={i}>
                        <Table.Cell>
                            <Skeleton className="h-4 w-4 rounded" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-10 w-10 rounded-lg" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-8 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <div className="space-y-1.5">
                                <Skeleton className="h-3 w-14 rounded-md" />
                                <Skeleton className="h-4 w-28 rounded-md" />
                            </div>
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </Table.Cell>
                        <Table.Cell>
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-28 rounded-md" />
                                <Skeleton className="h-3 w-16 rounded-md" />
                            </div>
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </Table.Cell>
                        <Table.Cell align="right">
                            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}
