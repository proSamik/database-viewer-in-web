import { Column, SortConfig, TextWrapping } from '@/types/TableViewerTypes';
import { useRef, useState, useEffect } from 'react';

interface TableHeaderProps {
    columns: Column[];
    columnVisibility: Record<string, boolean>;
    columnTextWrapping: TextWrapping;
    sortConfig: SortConfig;
    onSort: (columnName: string) => void;
    onTextWrappingChange: (columnName: string, value: 'wrap' | 'truncate') => void;
    onColumnResize?: (columnName: string, width: number) => void;
    columnWidths: Record<string, number>;
}

/**
 * Renders the table header with sorting, text wrapping controls, and resizable columns
 */
export function TableHeader({
    columns,
    columnVisibility,
    columnTextWrapping,
    sortConfig,
    onSort,
    onTextWrappingChange,
    onColumnResize,
    columnWidths
}: TableHeaderProps) {
    // State to track which column is being resized
    const [resizingColumn, setResizingColumn] = useState<string | null>(null);
    const [startX, setStartX] = useState<number>(0);
    const [startWidth, setStartWidth] = useState<number>(0);
    
    // Refs for column elements
    const columnRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
    
    // Handle mouse down on resize handle
    const handleResizeStart = (e: React.MouseEvent, columnName: string) => {
        e.preventDefault();
        e.stopPropagation();
        const column = columnRefs.current[columnName];
        if (column) {
            setResizingColumn(columnName);
            setStartX(e.clientX);
            setStartWidth(column.offsetWidth);
        }
    };
    
    // Handle mouse move during resize
    useEffect(() => {
        const handleResize = (e: MouseEvent) => {
            if (resizingColumn) {
                const width = Math.max(25, startWidth + (e.clientX - startX));
                if (onColumnResize) {
                    onColumnResize(resizingColumn, width);
                }
            }
        };
        
        const handleResizeEnd = () => {
            setResizingColumn(null);
        };
        
        if (resizingColumn) {
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', handleResizeEnd);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [resizingColumn, startX, startWidth, onColumnResize]);
    
    return (
        <thead className="bg-gray-50">
            <tr>
                {/* Actions column header */}
                <th className="px-2 py-3 sticky left-0 bg-gray-50 z-10 border border-gray-200" style={{ width: '60px', maxWidth: '60px' }}>
                    <div className="text-xs font-medium text-gray-500 uppercase">
                        Actions
                    </div>
                </th>

                {columns.map((column) => {
                    // Skip columns that are hidden
                    if (columnVisibility[column.name] === false) {
                        return null;
                    }
                    
                    const wrappingStyle = columnTextWrapping[column.name] || 'truncate';
                    const width = columnWidths[column.name] || 100;
                    
                    return (
                        <th
                            key={column.name}
                            ref={(el) => { columnRefs.current[column.name] = el; }}
                            className="px-6 py-3 text-xs font-medium text-gray-500 uppercase relative border border-gray-200"
                            style={{
                                width: `${width}px`,
                                minWidth: '25px',
                                maxWidth: `${width}px`,
                                cursor: resizingColumn === column.name ? 'col-resize' : 'default',
                                tableLayout: 'fixed'
                            }}
                        >
                            <div className="flex flex-col space-y-2">
                                {/* Header text */}
                                <div className="text-center truncate">
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
                                        value={wrappingStyle}
                                        onChange={(e) => onTextWrappingChange(
                                            column.name,
                                            e.target.value as 'wrap' | 'truncate'
                                        )}
                                        className="w-20 px-1 py-0.5 border rounded text-xs"
                                    >
                                        <option value="truncate">Truncate</option>
                                        <option value="wrap">Wrap</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Column resize handle */}
                            <div 
                                className="absolute top-0 right-0 h-full w-4 cursor-col-resize group z-20"
                                onMouseDown={(e) => handleResizeStart(e, column.name)}
                            >
                                <div className="absolute right-0 top-0 h-full w-1 bg-gray-300 opacity-0 group-hover:opacity-100"></div>
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
} 