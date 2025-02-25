import { Column, CellValue } from '@/types/TableViewerTypes';
import { TableActions } from './TableActions';
import { TableCell } from './TableCell';

interface TableRowProps {
    row: Record<string, CellValue> & { id: string | number };
    columns: Column[];
    columnVisibility: Record<string, boolean>;
    columnTextWrapping: Record<string, 'wrap' | 'truncate'>;
    highlightedCells: Record<string, string>;
    editingCell: {
        rowId: string | number;
        column: string;
        value: CellValue;
        tempValue: CellValue;
    } | null;
    copiedCell: string | null;
    onCopyRow: () => void;
    onEditRow: () => void;
    onDeleteRow: () => void;
    onEditCell: (value: CellValue) => void;
    onCellEditConfirm: () => void;
    onCellEditCancel: () => void;
    onCellClick?: (rowId: string | number, column: string, value: CellValue) => void;
    columnWidths: Record<string, number>;
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
    onCellEditCancel,
    onCellClick,
    columnWidths
}: TableRowProps) {
    return (
        <tr className="hover:bg-gray-50">
            <TableActions
                rowId={row.id}
                copiedCell={copiedCell}
                onCopy={onCopyRow}
                onEdit={onEditRow}
                onDelete={onDeleteRow}
                className="border border-gray-200"
                style={{ width: '60px', maxWidth: '60px' }}
            />

            {columns.map((column) => {
                // Skip columns that are hidden
                if (columnVisibility[column.name] === false) {
                    return null;
                }
                
                const wrappingStyle = columnTextWrapping[column.name] || 'truncate';
                const width = columnWidths[column.name] || 100;
                
                return (
                    <td 
                        key={column.name} 
                        className="px-6 py-4 text-sm text-gray-900 group relative border border-gray-200"
                        style={{
                            backgroundColor: highlightedCells[`${row.id}-${column.name}`] || 'transparent',
                            width: `${width}px`,
                            minWidth: '25px',
                            maxWidth: `${width}px`,
                            tableLayout: 'fixed'
                        }}
                    >
                        <div className={`relative ${wrappingStyle === 'wrap' ? '' : 'overflow-hidden'}`}>
                            <TableCell
                                column={column}
                                value={row[column.name]}
                                editingCell={editingCell?.rowId === row.id && editingCell?.column === column.name ? editingCell : null}
                                wrappingStyle={wrappingStyle}
                                onEdit={onEditCell}
                                onConfirm={onCellEditConfirm}
                                onCancel={onCellEditCancel}
                                onCellClick={onCellClick ? () => onCellClick(row.id, column.name, row[column.name]) : undefined}
                            />
                        </div>
                    </td>
                );
            })}
        </tr>
    );
} 