import { Button, tv } from "@heroui/react";
import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { TABLE_HEADER_TRACKING } from "../../constants/pricing";
import { INACTIVE_ICON_HOVER_OPACITY, SKELETON_ROW_HEIGHT } from "../../constants/ui-tokens";

const tableStyles = tv({
    slots: {
        wrapper: "overflow-hidden rounded-2xl shadow-sm",
        base: "w-full text-left bg-background border-collapse",
        thead: "bg-[var(--color-table-header)] sticky top-0 z-10",
        headerCell: `px-6 t-mini uppercase ${TABLE_HEADER_TRACKING} text-default-400 font-bold ${SKELETON_ROW_HEIGHT} align-middle`,
        bodyCell: "px-6 py-4 align-middle",
        row: `group/row transition-colors duration-200 odd:bg-[var(--color-zebra-odd)] even:bg-[var(--color-zebra-even)] hover:!bg-[var(--color-table-row-hover)] cursor-default`,
    }
});

const { wrapper, base, thead, headerCell, bodyCell, row } = tableStyles();

/**
 * Avant-Garde Table System
 *
 * @frozen This component's styles are LOCKED after design review (2026-01-29).
 *
 * DO NOT modify styling without explicit design approval:
 * - Row zebra stripes: defined in `src/index.css` (--color-zebra-*)
 * - Opacity tokens: defined in `src/constants/ui-tokens.ts`
 * - Typography: uses `t-mini` utility and `TABLE_HEADER_TRACKING`
 *
 * @see https://github.com/your-org/ERP/wiki/Table-Component (design spec)
 */
export function Table({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={wrapper({ className })}>
            <table className={base()}>
                {children}
            </table>
        </div>
    );
}

function Header({ children, className }: { children: ReactNode; className?: string }) {
    return <thead className={thead({ className })}>{children}</thead>;
}

function Column({ children, isBlack = false, align = 'left', className = "" }: {
    children: ReactNode;
    isBlack?: boolean;
    align?: 'left' | 'center' | 'right';
    className?: string;
}) {
    const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    const combinedClasses = headerCell({
        className: `${alignmentClass} ${isBlack ? 'text-default-500 font-black' : ''} ${className}`.trim()
    });

    return (
        <th className={combinedClasses}>
            {children}
        </th>
    );
}

interface SortButtonProps {
    label: string;
    isActive?: boolean;
    direction?: 'asc' | 'desc';
    onPress: () => void;
    isBlack?: boolean;
}

function SortButton({ label, isActive, direction, onPress, isBlack }: SortButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onPress={onPress}
            className={`px-2 -ml-2 t-mini uppercase ${TABLE_HEADER_TRACKING} hover:bg-default-100 rounded-lg group/btn transition-colors ${isBlack ? 'font-black text-default-500' : 'font-bold text-default-400 hover:text-foreground'
                }`}
        >
            {label}
            <Icon
                icon={isActive
                    ? (direction === 'asc' ? "lucide:chevron-up" : "lucide:chevron-down")
                    : "lucide:chevrons-up-down"
                }
                className={`ml-1 transition-opacity ${isActive ? 'opacity-100' : `opacity-0 ${INACTIVE_ICON_HOVER_OPACITY}`}`}
            />
        </Button>
    );
}

function Body({ children }: { children: ReactNode }) {
    return <tbody>{children}</tbody>;
}

function Row({ children, className, ...props }: { children: ReactNode; className?: string } & Omit<React.HTMLAttributes<HTMLTableRowElement>, 'children' | 'className'>) {
    return <tr className={row({ className })} {...props}>{children}</tr>;
}

function Cell({ children, align = 'left', className = "" }: {
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
}) {
    const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    return (
        <td className={bodyCell({ className: `${alignmentClass} ${className}` })}>
            {children}
        </td>
    );
}

Table.Header = Header;
Table.Column = Column;
Table.SortButton = SortButton;
Table.Body = Body;
Table.Row = Row;
Table.Cell = Cell;
