import { Column, SortConfig, TextWrapping } from '@/types/TableViewerTypes';

interface TableHeaderProps {
    columns: Column[];
    columnVisibility: Record<string, boolean>;
    columnTextWrapping: TextWrapping;
    sortConfig: SortConfig;
    onSort: (columnName: string) => void;
    onTextWrappingChange: (columnName: string, value: 'wrap' | 'truncate' | 'normal') => void;
}

/**
 * Renders the table header with sorting and text wrapping controls
 */
export function TableHeader({
    columns,
    columnVisibility,
    columnTextWrapping,
    sortConfig,
    onSort,
    onTextWrappingChange
}: TableHeaderProps) {
    return (
        <thead className="bg-gray-50">
            <tr>
                {/* Actions column header */}
                <th className="w-24 px-4 py-3 sticky left-0 bg-gray-50 z-10">
                    <div className="text-xs font-medium text-gray-500 uppercase">
                        Actions
                    </div>
                </th>

                {columns.map((column) => !columnVisibility[column.name] && (
                    <th
                        key={column.name}
                        className="px-6 py-3 text-xs font-medium text-gray-500 uppercase"
                    >
                        <div className="flex flex-col space-y-2">
                            {/* Header text */}
                            <div className="text-center">
                                <button 
                                    onClick={() => onSort(column.name)}
                                    className="inline-flex items-center justify-center hover:text-gray-700"
                                >
                                    {column.name.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                    {sortConfig.column === column.name && (
                                        <span className="ml-1">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Text wrapping controls */}
                            <div className="flex items-center justify-center space-x-2 text-xs">
                                <select
                                    value={columnTextWrapping[column.name] || 'normal'}
                                    onChange={(e) => onTextWrappingChange(
                                        column.name,
                                        e.target.value as 'wrap' | 'truncate' | 'normal'
                                    )}
                                    className="w-20 px-1 py-0.5 border rounded text-xs"
                                >
                                    <option value="normal">Show all</option>
                                    <option value="wrap">Wrap</option>
                                    <option value="truncate">Truncate</option>
                                </select>
                            </div>
                        </div>
                    </th>
                ))}
            </tr>
        </thead>
    );
} 