'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState, useCallback, useEffect } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { TableViewerState } from '@/types';
import { ClipboardIcon, CheckIcon, TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { EditRowDialog } from './EditRowDialog';
import { Switch } from '@headlessui/react';

interface Props {
    tableName: string;
    onReset: () => void;
}

interface TableSchema {
    columns: Array<{
        name: string;
        dataType: string;
        isNullable: boolean;
        isPrimary: boolean;
    }>;
}

interface TableResponse {
    rows: Record<string, any>[];
    totalCount: number;
    page: number;
    pageSize: number;
}

// Function to format date as DD MM YY
const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return format(date, 'dd MMM yy');
    } catch {
        return dateStr;
    }
};

// Function to convert PostgreSQL types to MUI DataGrid column types
const getColumnType = (pgType: string): 'string' | 'number' | 'boolean' => {
    switch (pgType.toLowerCase()) {
        case 'integer':
        case 'bigint':
        case 'smallint':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'timestamp':
        case 'date':
        case 'uuid':
        case 'character varying':
        case 'text':
        default:
            return 'string';
    }
};

// Updated transform data function
const transformData = (rows: Record<string, any>[], schema: TableSchema) => {
    return rows.map(row => {
        const transformedRow = { ...row };
        schema.columns.forEach(col => {
            if (col.dataType.toLowerCase().includes('timestamp') || col.dataType.toLowerCase() === 'date') {
                transformedRow[col.name] = row[col.name] ? formatDate(row[col.name]) : null;
            }
        });
        return transformedRow;
    });
};

// Add these type definitions
type ColumnVisibility = Record<string, boolean>;
type ColumnWidth = Record<string, number>;
type TextWrapping = Record<string, 'wrap' | 'truncate' | 'normal'>;

export function TableViewer({ tableName, onReset }: Props) {
    // Add this near the top of the component
    const queryClient = useQueryClient();

    // Replace useState with usePersistedState for states we want to persist
    const [tableState, setTableState] = usePersistedState<TableViewerState>('tableViewerState', {
        columnVisibility: {},
        columnWidths: {},
        columnTextWrapping: {},
        pageSize: 25,
        selectedTable: tableName
    });

    const [page, setPage] = useState(0);
    const [highlightedCells, setHighlightedCells] = useState<Record<string, string>>({});
    const [searchText, setSearchText] = useState('');
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
    const [showHighlightMenu, setShowHighlightMenu] = useState(false);
    const [sortConfig, setSortConfig] = useState<{
        column: string | null;
        direction: 'asc' | 'desc' | null;
    }>({ column: null, direction: null });
    const [copiedCell, setCopiedCell] = useState<string | null>(null);
    const [editDialog, setEditDialog] = useState<{
        isOpen: boolean;
        mode: 'create' | 'edit';
        data?: Record<string, any>;
    }>({ isOpen: false, mode: 'create' });
    const [editingCell, setEditingCell] = useState<{
        rowId: string | number;
        column: string;
        value: any;
    } | null>(null);

    // Add this state for page input
    const [pageInput, setPageInput] = useState<string>((page + 1).toString());

    // Update the state setters with proper typing
    const setColumnVisibility = (
        newVisibility: ColumnVisibility | ((prev: ColumnVisibility) => ColumnVisibility)
    ) => {
        setTableState(prev => ({
            ...prev,
            columnVisibility: typeof newVisibility === 'function' 
                ? newVisibility(prev.columnVisibility)
                : newVisibility
        }));
    };

    const setColumnWidths = (
        newWidths: ColumnWidth | ((prev: ColumnWidth) => ColumnWidth)
    ) => {
        setTableState(prev => ({
            ...prev,
            columnWidths: typeof newWidths === 'function'
                ? newWidths(prev.columnWidths)
                : newWidths
        }));
    };

    const setColumnTextWrapping = (
        newWrapping: TextWrapping | ((prev: TextWrapping) => TextWrapping)
    ) => {
        setTableState(prev => ({
            ...prev,
            columnTextWrapping: typeof newWrapping === 'function'
                ? newWrapping(prev.columnTextWrapping)
                : newWrapping
        }));
    };

    // Update references to the state throughout the component
    const { columnVisibility, columnWidths, columnTextWrapping, pageSize } = tableState;

    // Fetch schema first
    const { data: schemaData, isLoading: schemaLoading } = useQuery<TableSchema>({
        queryKey: ['tableSchema', tableName],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/schema`
            );
            if (!response.ok) throw new Error('Failed to fetch schema');
            return response.json();
        },
        enabled: !!tableName,
    });

    // Then fetch data with pagination
    const { data: tableData, isLoading: dataLoading } = useQuery<TableResponse>({
        queryKey: ['tableData', tableName, page, pageSize],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}?page=${page}&pageSize=${pageSize}`
            );
            if (!response.ok) throw new Error('Failed to fetch table data');
            const data = await response.json();
            return data;
        },
        enabled: !!tableName && !!schemaData,
    });

    // Update the toggle functions with proper typing
    const toggleColumnVisibility = (columnName: string) => {
        setColumnVisibility((prev: ColumnVisibility) => ({
            ...prev,
            [columnName]: !prev[columnName]
        }));
    };

    // Handle cell highlighting
    const highlightCell = (rowId: string | number, columnName: string, color: string) => {
        const cellKey = `${rowId}-${columnName}`;
        setHighlightedCells(prev => ({
            ...prev,
            [cellKey]: color
        }));
    };

    // Clear all highlights
    const clearHighlights = () => {
        setHighlightedCells({});
    };

    // Filter rows based on search
    const filteredRows = tableData?.rows.filter(row => 
        !searchText || Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    ) || [];

    // Update the toggle functions with proper typing
    const toggleColumnWrapping = (columnName: string) => {
        setColumnTextWrapping((prev: TextWrapping) => {
            const current = prev[columnName] || 'normal';
            const next = current === 'normal' ? 'wrap' : 
                        current === 'wrap' ? 'truncate' : 'normal';
            return { ...prev, [columnName]: next };
        });
    };

    // Get wrapping class based on column setting
    const getWrappingClass = (columnName: string) => {
        const wrapping = columnTextWrapping[columnName] || 'normal';
        switch (wrapping) {
            case 'wrap': 
                return 'whitespace-normal break-words';
            case 'truncate': 
                return 'truncate';
            case 'normal': 
                return 'overflow-x-auto whitespace-nowrap';
            default: 
                return 'whitespace-nowrap';
        }
    };

    // Add sorting function
    const handleSort = (columnName: string) => {
        setSortConfig(current => ({
            column: columnName,
            direction: 
                current.column === columnName && current.direction === 'asc' 
                    ? 'desc' 
                    : 'asc'
        }));
    };

    // Sort the filtered rows
    const sortedRows = [...filteredRows].sort((a, b) => {
        if (!sortConfig.column || !sortConfig.direction) return 0;
        
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];
        
        if (aVal === bVal) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        
        return (
            (aVal < bVal ? -1 : 1) * 
            (sortConfig.direction === 'asc' ? 1 : -1)
        );
    });

    const resetTableState = () => {
        setTableState({
            columnVisibility: {},
            columnWidths: {},
            columnTextWrapping: {},
            pageSize: 25,
            selectedTable: tableName
        });
    };

    // Update the width change handler
    const handleColumnWidthChange = (columnName: string, width: number) => {
        setColumnWidths((prev: ColumnWidth) => ({
            ...prev,
            [columnName]: width
        }));
    };

    // Add this function to handle page size changes
    const setPageSize = (size: number) => {
        setTableState(prev => ({
            ...prev,
            pageSize: size
        }));
    };

    // Update the copy function
    const copyToClipboard = async (value: any, cellId: string) => {
        try {
            // Copy the original value
            const textToCopy = value === null ? 'null' : 
                typeof value === 'object' && value instanceof Date ? value.toISOString() : 
                String(value);

            await navigator.clipboard.writeText(textToCopy);
            setCopiedCell(cellId);
            setTimeout(() => {
                setCopiedCell(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // Update the copyRowToClipboard function
    const copyRowToClipboard = async (row: Record<string, any>) => {
        try {
            // Filter out any UI-specific fields and copy original data
            const rowText = Object.entries(row)
                .filter(([key]) => key !== 'id' && !key.startsWith('_')) // Exclude UI-specific fields
                .map(([key, value]) => {
                    // Get original value without formatting
                    if (value === null) return `${key}: null`;
                    if (typeof value === 'object' && value instanceof Date) {
                        return `${key}: ${value.toISOString()}`;
                    }
                    return `${key}: ${value}`;
                })
                .join('\n');

            await navigator.clipboard.writeText(rowText);
            setCopiedCell(`row-${row.id}`);
            setTimeout(() => {
                setCopiedCell(null);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy row:', err);
        }
    };

    // Add these mutation functions
    const handleCreateRow = async (data: Record<string, any>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create row');
            
            // Refetch the data
            await queryClient.invalidateQueries({
                queryKey: ['tableData', tableName]
            });
        } catch (error) {
            throw error;
        }
    };

    const handleUpdateRow = async (id: string, data: Record<string, any>) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows/${id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );

            if (!response.ok) throw new Error('Failed to update row');
            
            // Refetch the data
            await queryClient.invalidateQueries({
                queryKey: ['tableData', tableName]
            });
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteRow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this row?')) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) throw new Error('Failed to delete row');
            
            // Refetch the data
            await queryClient.invalidateQueries({
                queryKey: ['tableData', tableName]
            });
        } catch (error) {
            console.error('Failed to delete row:', error);
        }
    };

    // Add cell update handler
    const handleCellUpdate = async (rowId: string | number, column: string, value: any) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows/${rowId}/cells/${column}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value }),
                }
            );

            if (!response.ok) throw new Error('Failed to update cell');
            
            // Refetch the data
            await queryClient.invalidateQueries({
                queryKey: ['tableData', tableName]
            });
            
            setEditingCell(null);
        } catch (error) {
            console.error('Failed to update cell:', error);
        }
    };

    // Add cell renderer
    const renderCell = (row: any, column: any) => {
        const isEditing = editingCell?.rowId === row.id && editingCell?.column === column.name;
        const value = row[column.name];

        if (isEditing) {
            switch (column.dataType.toLowerCase()) {
                case 'boolean':
                    return (
                        <Switch
                            checked={value}
                            onChange={(checked) => handleCellUpdate(row.id, column.name, checked)}
                            className={`${
                                value ? 'bg-blue-600' : 'bg-gray-200'
                            } relative inline-flex h-6 w-11 items-center rounded-full`}
                        >
                            <span className={`${
                                value ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                        </Switch>
                    );
                case 'timestamp with time zone':
                case 'timestamp without time zone':
                case 'timestamp':
                case 'date':
                    return (
                        <input
                            type="datetime-local"
                            value={formatDateForInput(new Date(value))}
                            onChange={(e) => handleCellUpdate(row.id, column.name, e.target.value)}
                            className="w-full p-1 border rounded"
                            autoFocus
                        />
                    );
                default:
                    return (
                        <input
                            type={getInputType(column.dataType)}
                            value={value || ''}
                            onChange={(e) => handleCellUpdate(row.id, column.name, e.target.value)}
                            className="w-full p-1 border rounded"
                            autoFocus
                            onBlur={() => setEditingCell(null)}
                        />
                    );
            }
        }

        return (
            <div
                className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setEditingCell({ rowId: row.id, column: column.name, value })}
            >
                {formatCellValue(value, column.dataType)}
            </div>
        );
    };

    // Add this function to handle page input changes
    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPageInput(value);
    };

    // Add this function to handle page input submission
    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPage = parseInt(pageInput, 10);
        if (isNaN(newPage)) {
            setPageInput((page + 1).toString());
            return;
        }

        // Validate page range
        if (newPage < 1) {
            setPage(0);
            setPageInput("1");
        } else if (newPage > totalPages) {
            setPage(totalPages - 1);
            setPageInput(totalPages.toString());
        } else {
            setPage(newPage - 1);
        }
    };

    // Update useEffect to sync page input with page state
    useEffect(() => {
        setPageInput((page + 1).toString());
    }, [page]);

    if (schemaLoading || dataLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!schemaData || !tableData?.rows?.length) {
        return <div className="p-4 text-gray-500">No data available</div>;
    }

    const totalPages = Math.ceil((tableData.totalCount || 0) / pageSize);

    // Format cell value based on schema
    const formatCellValue = (value: any, columnName: string) => {
        if (value === null) return '-';
        
        const columnSchema = schemaData.columns.find(col => col.name === columnName);
        if (!columnSchema) return String(value);

        switch (columnSchema.dataType.toLowerCase()) {
            case 'timestamp with time zone':
            case 'timestamp without time zone':
            case 'timestamp':
            case 'date':
                return formatDate(value);
            case 'boolean':
                return value ? 'Yes' : 'No';
            default:
                return String(value);
        }
    };

    // Helper function for date formatting
    function formatDateForInput(date: Date): string {
        return date.toISOString().slice(0, 16);
    }

    // Helper function to get default values for non-nullable fields
    function getDefaultValue(dataType: string) {
        switch (dataType.toLowerCase()) {
            case 'integer':
            case 'bigint':
            case 'smallint':
            case 'numeric':
            case 'decimal':
                return 0;
            case 'boolean':
                return false;
            case 'timestamp':
            case 'timestamp without time zone':
            case 'timestamp with time zone':
            case 'date':
                return new Date();
            default:
                return '';
        }
    }

    // Helper function to get input type based on data type
    function getInputType(dataType: string): string {
        switch (dataType.toLowerCase()) {
            case 'integer':
            case 'bigint':
            case 'smallint':
            case 'numeric':
            case 'decimal':
                return 'number';
            case 'boolean':
                return 'checkbox';
            case 'timestamp with time zone':
            case 'timestamp without time zone':
            case 'timestamp':
            case 'date':
                return 'datetime-local';
            default:
                return 'text';
        }
    }

    return (
        <div className="flex flex-col w-full h-full">
            {/* Add New Row button */}
            <div className="mb-4">
                <button
                    onClick={() => setEditDialog({ isOpen: true, mode: 'create' })}
                    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Row
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center space-x-4 mb-4 p-2 bg-white border rounded-lg">
                {/* Column visibility toggle */}
                <div className="relative">
                    <button 
                        onClick={() => setShowColumnMenu(!showColumnMenu)}
                        className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
                    >
                        Columns
                    </button>
                    
                    {showColumnMenu && (
                        <div className="absolute z-10 mt-2 w-64 bg-white border rounded-lg shadow-lg">
                            <div className="p-2">
                                {schemaData?.columns.map(column => (
                                    <div key={column.name} className="flex items-center p-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={!columnVisibility[column.name]}
                                            onChange={() => toggleColumnVisibility(column.name)}
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
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Updated Highlight tools */}
                <div className="relative">
                    <button 
                        onClick={() => setShowHighlightMenu(!showHighlightMenu)}
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
                                        onClick={() => setShowHighlightMenu(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>
                                <select
                                    value={selectedColumn || ''}
                                    onChange={(e) => setSelectedColumn(e.target.value)}
                                    className="w-full mb-2 p-2 border rounded-md"
                                >
                                    <option value="">Select Column</option>
                                    {schemaData?.columns.map(col => (
                                        <option key={col.name} value={col.name}>
                                            {col.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {['#FFE0B2', '#C8E6C9', '#B3E5FC', '#FFCDD2'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                if (selectedColumn) {
                                                    filteredRows.forEach(row => {
                                                        highlightCell(row.id, selectedColumn, color);
                                                    });
                                                }
                                            }}
                                            className="w-8 h-8 rounded border"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={clearHighlights}
                                    className="w-full py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md border"
                                >
                                    Clear Highlights
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table with updated column widths and text wrapping */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Combined Actions column header */}
                            <th className="w-24 px-4 py-3 sticky left-0 bg-gray-50 z-10">
                                <div className="text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </div>
                            </th>

                            {schemaData?.columns.map((column, index) => !columnVisibility[column.name] && (
                                <th
                                    key={column.name}
                                    className="px-6 py-3 text-xs font-medium text-gray-500 uppercase"
                                >
                                    <div className="flex flex-col space-y-2">
                                        {/* Header text */}
                                        <div className="text-center">
                                            <button 
                                                onClick={() => handleSort(column.name)}
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

                                        {/* Controls */}
                                        <div className="flex items-center justify-center space-x-2 text-xs">
                                            <select
                                                value={columnTextWrapping[column.name] || 'normal'}
                                                onChange={(e) => setColumnTextWrapping((prev: TextWrapping) => ({
                                                    ...prev,
                                                    [column.name]: e.target.value as 'wrap' | 'truncate' | 'normal'
                                                }))}
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
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRows.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                                {/* Combined Actions cell */}
                                <td className="w-24 px-4 py-4 sticky left-0 bg-white z-10">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => copyRowToClipboard(row)}
                                            className="p-1 rounded hover:bg-gray-100"
                                            title="Copy row"
                                        >
                                            {copiedCell === `row-${row.id}` ? (
                                                <CheckIcon className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ClipboardIcon className="h-4 w-4 text-gray-500" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setEditDialog({ 
                                                isOpen: true, 
                                                mode: 'edit', 
                                                data: row 
                                            })}
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="Edit row"
                                        >
                                            <PencilIcon className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRow(row.id)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="Delete row"
                                        >
                                            <TrashIcon className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>

                                {/* Data cells */}
                                {schemaData?.columns.map((column) => !columnVisibility[column.name] && (
                                    <td 
                                        key={column.name} 
                                        className="px-6 py-4 text-sm text-gray-900 group"
                                        style={{
                                            backgroundColor: highlightedCells[`${row.id}-${column.name}`] || 'transparent',
                                            width: '200px', // Fixed width
                                            maxWidth: '200px'
                                        }}
                                    >
                                        {renderCell(row, column)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex items-center space-x-4">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="border border-gray-300 rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size} rows
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Page</span>
                        <form onSubmit={handlePageSubmit} className="flex items-center space-x-2">
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageInput}
                                onChange={handlePageInputChange}
                                onBlur={handlePageSubmit}
                                className="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">of {totalPages}</span>
                        </form>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setPage(0)}
                        disabled={page === 0}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="First page"
                    >
                        ««
                    </button>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Previous page"
                    >
                        «
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Next page"
                    >
                        »
                    </button>
                    <button
                        onClick={() => setPage(totalPages - 1)}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Last page"
                    >
                        »»
                    </button>
                </div>
            </div>

            {/* Add EditRowDialog */}
            {editDialog.isOpen && schemaData && (
                <EditRowDialog
                    isOpen={editDialog.isOpen}
                    onClose={() => setEditDialog({ isOpen: false, mode: 'create' })}
                    onSave={async (data) => {
                        if (editDialog.mode === 'create') {
                            await handleCreateRow(data);
                        } else {
                            await handleUpdateRow(editDialog.data?.id, data);
                        }
                    }}
                    schema={schemaData}
                    initialData={editDialog.data}
                    mode={editDialog.mode}
                />
            )}
        </div>
    );
} 