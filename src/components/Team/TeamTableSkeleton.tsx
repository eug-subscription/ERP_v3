import { Skeleton } from "@heroui/react";
import { Table } from "../pricing/Table";

/** Rows shown while loading — approximates default page size to avoid layout shift. */
const SKELETON_ROW_COUNT = 10;

export function TeamTableSkeleton() {
    return (
        <Table>
            <Table.Header>
                <tr>
                    <Table.Column className="w-12">Avatar</Table.Column>
                    <Table.Column isBlack>Name</Table.Column>
                    <Table.Column>Email</Table.Column>
                    <Table.Column>Role</Table.Column>
                    <Table.Column>Status</Table.Column>
                    <Table.Column>Date Joined</Table.Column>
                    <Table.Column>Country</Table.Column>
                    <Table.Column>City</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                    <Table.Row key={i}>
                        <Table.Cell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-28 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-36 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-24 rounded-md" />
                        </Table.Cell>
                        <Table.Cell>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </Table.Cell>
                        <Table.Cell align="right">
                            <Skeleton className="h-7 w-7 rounded-full ml-auto" />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    );
}
