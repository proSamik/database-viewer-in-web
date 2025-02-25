import { Column, CellValue, EditingCellState } from '@/types/TableViewerTypes';
import { formatCellValue, getInputType, isTimestampType, getWrappingClass } from '@/lib/TableViewerUtils';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TableCellProps {
    column: Column;
    value: CellValue;
    editingCell: EditingCellState | null;
    wrappingStyle: 'wrap' | 'truncate';
    onEdit: (value: CellValue) => void;
    onConfirm: () => void;
    onCancel: () => void;
    onCellClick?: () => void;
}

/**
 * Renders a table cell with proper formatting and editing capabilities
 * Supports different text wrapping modes: wrap and truncate
 */
export function TableCell({
    column,
    value,
    editingCell,
    wrappingStyle,
    onEdit,
    onConfirm,
    onCancel,
    onCellClick
}: TableCellProps) {
    // If the cell is being edited, show the edit interface
    if (editingCell) {
        return (
            <div className="flex items-center min-w-0 max-w-full">
                <div className="flex-1 min-w-0">
                    {column.dataType.toLowerCase() === 'boolean' ? (
                        <input
                            type="checkbox"
                            checked={Boolean(editingCell.tempValue)}
                            onChange={(e) => onEdit(e.target.checked)}
                            className="w-4 h-4"
                        />
                    ) : isTimestampType(column.dataType) ? (
                        <input
                            type="datetime-local"
                            value={String(editingCell.tempValue || '')}
                            onChange={(e) => onEdit(e.target.value)}
                            className="w-full p-1 border rounded"
                            autoFocus
                        />
                    ) : (
                        <input
                            type={getInputType(column.dataType)}
                            value={String(editingCell.tempValue || '')}
                            onChange={(e) => onEdit(e.target.value)}
                            className="w-full p-1 border rounded"
                            autoFocus
                        />
                    )}
                </div>
                <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                    <button
                        onClick={onConfirm}
                        className="p-1 rounded hover:bg-green-50 text-green-600"
                        title="Confirm"
                    >
                        <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                        title="Cancel"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Otherwise, show the formatted value with appropriate wrapping
    const baseClasses = "cursor-pointer hover:bg-gray-50 p-1 rounded";
    const wrapClasses = getWrappingClass(wrappingStyle);
    
    return (
        <div 
            className={`${baseClasses} ${wrapClasses} w-full block`}
            onClick={onCellClick}
            title={String(formatCellValue(value, column.dataType))}
        >
            {formatCellValue(value, column.dataType)}
        </div>
    );
} 