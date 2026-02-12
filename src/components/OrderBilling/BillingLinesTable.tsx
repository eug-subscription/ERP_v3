import { useState } from "react";
import { BillingLineInstance } from "../../types/pricing";
import { BillingLineRow } from "./BillingLineRow";
import { Table } from "../pricing/Table";

interface BillingLinesTableProps {
    lines: BillingLineInstance[];
    onEditQuantity?: (line: BillingLineInstance) => void;
    onEditModifiers?: (line: BillingLineInstance) => void;
    onVoidLine?: (line: BillingLineInstance) => void;
    updatingQuantityId?: string | null;
    updatingModifiersId?: string | null;
}

export function BillingLinesTable({
    lines,
    onEditQuantity,
    onEditModifiers,
    onVoidLine,
    updatingQuantityId,
    updatingModifiersId
}: BillingLinesTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <Table className="min-w-[800px]">
            <Table.Header>
                <tr>
                    <Table.Column className="w-12">{""}</Table.Column>
                    <Table.Column isBlack>Rate Item</Table.Column>
                    <Table.Column>Qty</Table.Column>
                    <Table.Column>Rate</Table.Column>
                    <Table.Column align="right">Revenue</Table.Column>
                    <Table.Column align="right">Expense</Table.Column>
                    <Table.Column align="right">Actions</Table.Column>
                </tr>
            </Table.Header>
            <Table.Body>
                {lines.map((line) => (
                    <BillingLineRow
                        key={line.id}
                        line={line}
                        isExpanded={expandedRows.has(line.id)}
                        onToggleExpand={() => toggleRow(line.id)}
                        onEditQuantity={onEditQuantity}
                        onEditModifiers={onEditModifiers}
                        onVoidLine={onVoidLine}
                        isUpdatingQuantity={updatingQuantityId === line.id}
                        isUpdatingModifiers={updatingModifiersId === line.id}
                    />
                ))}
            </Table.Body>
        </Table>
    );
}
