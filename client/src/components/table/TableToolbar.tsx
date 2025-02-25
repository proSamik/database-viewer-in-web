import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Column } from '@/types/TableViewerTypes';

interface TableToolbarProps {
    columns: Column[];
    searchText: string;
    showColumnMenu: boolean;
    showHighlightMenu: boolean;
    selectedColumn: string | null;
    columnVisibility: Record<string, boolean>;
    isLoading: boolean;
    actionsColumnVisible: boolean;
    onSearchChange: (value: string) => void;
    onColumnMenuToggle: () => void;
    onHighlightMenuToggle: () => void;
    onColumnVisibilityChange: (columnName: string) => void;
    onColumnSelect: (columnName: string) => void;
    onHighlightColor: (color: string) => void;
    onClearHighlights: () => void;
    onReload: () => void;
    onActionsColumnToggle: () => void;
}

/**
 * Renders the table toolbar with search, column visibility, and highlighting controls
 */
export function TableToolbar({
    columns,
    searchText,
    showColumnMenu,
    showHighlightMenu,
    selectedColumn,
    columnVisibility,
    isLoading,
    actionsColumnVisible,
    onSearchChange,
    onColumnMenuToggle,
    onHighlightMenuToggle,
    onColumnVisibilityChange,
    onColumnSelect,
    onHighlightColor,
    onClearHighlights,
    onReload,
    onActionsColumnToggle
}: TableToolbarProps) {
    return (
        <div className="flex items-center space-x-4 mb-4 p-2 bg-white border rounded-lg">
            {/* Reload Button */}
            <button
                onClick={onReload}
                className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center space-x-1"
                title="Reload data"
            >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Reload</span>
            </button>

            {/* Column visibility toggle */}
            <div className="relative">
                <button 
                    onClick={onColumnMenuToggle}
                    className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                    Columns
                </button>
                
                {showColumnMenu && (
                    <div className="absolute mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
                        <div className="p-2">
                            {/* Actions column toggle */}
                            <div className="flex items-center p-2 hover:bg-gray-50 border-b mb-2">
                                <input
                                    type="checkbox"
                                    checked={actionsColumnVisible}
                                    onChange={onActionsColumnToggle}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium">Actions Column</span>
                            </div>
                            
                            {columns.map(column => (
                                <div key={column.name} className="flex items-center p-2 hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={columnVisibility[column.name] !== false}
                                        onChange={() => onColumnVisibilityChange(column.name)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{column.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search input */}
            <div className="flex-1">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Highlight menu */}
            <div className="relative">
                <button 
                    onClick={onHighlightMenuToggle}
                    className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                    Highlight
                </button>
                
                {showHighlightMenu && (
                    <div className="absolute z-10 mt-2 w-64 bg-white border rounded-lg shadow-lg right-0">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-medium">Highlight Columns</h3>
                                <button 
                                    onClick={onHighlightMenuToggle}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>
                            <select
                                value={selectedColumn || ''}
                                onChange={(e) => onColumnSelect(e.target.value)}
                                className="w-full mb-2 p-2 border rounded-md"
                            >
                                <option value="">Select Column</option>
                                {columns.map(col => (
                                    <option key={col.name} value={col.name}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {['#FFE0B2', '#C8E6C9', '#B3E5FC', '#FFCDD2'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => onHighlightColor(color)}
                                        className="w-8 h-8 rounded border"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={onClearHighlights}
                                className="w-full py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md border"
                            >
                                Clear Highlights
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 