import { Column, CellValue, EditingCellState } from '@/types/TableViewerTypes';
import { TableActions } from './TableActions';
import { TableCell } from './TableCell';

interface TableRowProps {
    row: Record<string, CellValue> & { id: string | number };
    columns: Column[];
    columnVisibility: Record<string, boolean>;
    columnTextWrapping: Record<string, 'wrap' | 'truncate' | 'normal'>;
    highlightedCells: Record<string, string>;
    editingCell: EditingCellState | null;
    copiedCell: string | null;
    onCopyRow: () => void;
    onEditRow: () => void;
    onDeleteRow: () => void;
    onEditCell: (column: string, value: CellValue) => void;
    onCellEditConfirm: () => void;
    onCellEditCancel: () => void;
}

/**
 * Renders a table row with cells and actions
 */
export function TableRow({
    row,
    columns,
    columnVisibility,
    columnTextWrapping,
    highlightedCells,
    editingCell,
    copiedCell,
    onCopyRow,
    onEditRow,
    onDeleteRow,
    onEditCell,
    onCellEditConfirm,
    onCellEditCancel
}: TableRowProps) {
    return (
        <tr className="hover:bg-gray-50">
            <TableActions
                rowId={row.id}
                copiedCell={copiedCell}
                onCopy={onCopyRow}
                onEdit={onEditRow}
                onDelete={onDeleteRow}
            />

            {columns.map((column) => !columnVisibility[column.name] && (
                <td 
                    key={column.name} 
                    className="px-6 py-4 text-sm text-gray-900 group relative"
                    style={{
                        backgroundColor: highlightedCells[`${row.id}-${column.name}`] || 'transparent',
                        minWidth: '200px',
                        maxWidth: '300px'
                    }}
                >
                    <div className="relative overflow-hidden">
                        <TableCell
                            column={column}
                            value={row[column.name]}
                            editingCell={editingCell?.column === column.name ? editingCell : null}
                            wrappingStyle={columnTextWrapping[column.name] || 'normal'}
                            onEdit={(value) => onEditCell(column.name, value)}
                            onConfirm={onCellEditConfirm}
                            onCancel={onCellEditCancel}
                        />
                    </div>
                </td>
            ))}
        </tr>
    );
} 