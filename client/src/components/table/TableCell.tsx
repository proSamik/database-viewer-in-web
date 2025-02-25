import { Switch } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CellValue, Column, EditingCellState } from '@/types/TableViewerTypes';
import { formatCellValue, getInputType, isTimestampType } from '@/lib/TableViewerUtils';

interface TableCellProps {
    column: Column;
    value: CellValue;
    editingCell: EditingCellState | null;
    wrappingStyle: 'wrap' | 'truncate' | 'normal';
    onEdit: (value: CellValue) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Renders a table cell with editing capabilities
 */
export function TableCell({
    column,
    value,
    editingCell,
    wrappingStyle,
    onEdit,
    onConfirm,
    onCancel
}: TableCellProps) {
    if (editingCell) {
        return (
            <div className="flex items-center min-w-0 max-w-full">
                <div className="flex-1 min-w-0">
                    {column.dataType.toLowerCase() === 'boolean' ? (
                        <Switch
                            checked={Boolean(editingCell.tempValue)}
                            onChange={(checked) => onEdit(checked)}
                            className={`${
                                editingCell.tempValue ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full`}
                        >
                            <span className={`${
                                editingCell.tempValue ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                        </Switch>
                    ) : (
                        <input
                            type={getInputType(column.dataType)}
                            value={String(editingCell.tempValue ?? '')}
                            onChange={(e) => onEdit(e.target.value)}
                            className="w-full p-1 border rounded"
                            autoFocus
                        />
                    )}
                </div>
                <div className="flex items-center space-x-1 ml-2">
                    <button
                        onClick={onConfirm}
                        className="p-1 rounded hover:bg-green-50 text-green-600"
                    >
                        <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    const wrappingClass = {
        wrap: 'whitespace-normal break-words',
        truncate: 'truncate',
        normal: 'whitespace-pre overflow-x-auto'
    }[wrappingStyle] || 'whitespace-nowrap';

    return (
        <div className={`cursor-pointer hover:bg-gray-50 p-1 rounded ${wrappingClass}`}>
            {formatCellValue(value, column.dataType)}
        </div>
    );
} 