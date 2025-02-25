'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePersistedState } from '@/hooks/usePersistedState';
import { TableSchema, TableResponse, TableViewerState, EditDialogState, EditingCellState, CellValue } from '@/types/TableViewerTypes';
import { EditRowDialog } from '@/components/EditRowDialog';
import { TableHeader } from '@/components/table/TableHeader';
import { TableToolbar } from '@/components/table/TableToolbar';
import { TableRow } from '@/components/table/TableRow';
import { TablePagination } from '@/components/table/TablePagination';
import { 
    formatCellValue, 
    getInputType, 
    isTimestampType, 
    getPrimaryKeyColumn,
    getWrappingClass
} from '@/lib/TableViewerUtils';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DataTableProps {
    tableName: string;
    onReset: () => void;
}

// Update the row type to ensure id is always present
type TableRow = Record<string, CellValue> & { id: string | number };

/**
 * A data table component with sorting, filtering, pagination, and inline editing capabilities
 */
export function DataTable({ tableName, onReset }: DataTableProps) {
    const queryClient = useQueryClient();

    // State management
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
    const [sortConfig, setSortConfig] = useState<{ column: string | null; direction: 'asc' | 'desc' | null; }>({ 
        column: null, 
        direction: null 
    });
    const [copiedCell, setCopiedCell] = useState<string | null>(null);
    const [editDialog, setEditDialog] = useState<EditDialogState>({ isOpen: false, mode: 'create' });
    const [editingCell, setEditingCell] = useState<{
        rowId: string | number;
        column: string;
        value: CellValue;
        tempValue: CellValue;
    } | null>(null);
    const [pageInput, setPageInput] = useState('1');
    const [actionsColumnVisible, setActionsColumnVisible] = useState(true);

    const { columnVisibility, columnTextWrapping, columnWidths, pageSize } = tableState;

    // Data fetching
    const { data: schemaData, isLoading: schemaLoading } = useQuery<TableSchema>({
        queryKey: ['schema', tableName],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/schema`);
            if (!response.ok) throw new Error('Failed to fetch schema');
            return response.json();
        },
    });

    const { data: tableData, isLoading: dataLoading, error } = useQuery<TableResponse>({
        queryKey: ['table', tableName, page, pageSize],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}?page=${page}&pageSize=${pageSize}`
            );
            if (!response.ok) throw new Error('Failed to fetch table data');
            return response.json();
        },
    });

    // Event handlers
    const handleSort = useCallback((columnName: string) => {
        setSortConfig(current => ({
            column: columnName,
            direction: current.column === columnName && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const handleColumnVisibilityChange = useCallback((columnName: string) => {
        setTableState(prev => ({
            ...prev,
            columnVisibility: {
                ...prev.columnVisibility,
                [columnName]: !prev.columnVisibility[columnName]
            }
        }));
    }, [setTableState]);

    const handleColumnResize = useCallback((columnName: string, width: number) => {
        setTableState(prev => ({
            ...prev,
            columnWidths: {
                ...prev.columnWidths,
                [columnName]: width
            }
        }));
    }, [setTableState]);

    const handleTextWrappingChange = useCallback((columnName: string, value: 'wrap' | 'truncate') => {
        setTableState(prev => ({
            ...prev,
            columnTextWrapping: {
                ...prev.columnTextWrapping,
                [columnName]: value
            }
        }));
    }, [setTableState]);

    // Initialize column text wrapping to 'truncate' for new columns
    useEffect(() => {
        if (schemaData?.columns) {
            const newWrapping: Record<string, 'wrap' | 'truncate'> = {};
            let needsUpdate = false;
            
            schemaData.columns.forEach(column => {
                if (!columnTextWrapping[column.name]) {
                    newWrapping[column.name] = 'truncate';
                    needsUpdate = true;
                }
            });
            
            if (needsUpdate) {
                setTableState(prev => ({
                    ...prev,
                    columnTextWrapping: {
                        ...prev.columnTextWrapping,
                        ...newWrapping
                    }
                }));
            }
        }
    }, [schemaData?.columns, columnTextWrapping, setTableState]);

    const handleHighlightCell = useCallback((rowId: string | number, columnName: string, color: string) => {
        setHighlightedCells(prev => ({
            ...prev,
            [`${rowId}-${columnName}`]: color
        }));
    }, []);

    const handleClearHighlights = useCallback(() => {
        setHighlightedCells({});
    }, []);

    const handleCopyRow = useCallback(async (row: TableRow) => {
        try {
            const rowText = Object.entries(row)
                .filter(([key]) => key !== 'id' && !key.startsWith('_'))
                .map(([key, value]) => {
                    if (value === null) return `${key}: null`;
                    if (value instanceof Date) return `${key}: ${value.toISOString()}`;
                    return `${key}: ${value}`;
                })
                .join('\n');

            await navigator.clipboard.writeText(rowText);
            setCopiedCell(`row-${row.id}`);
            setTimeout(() => setCopiedCell(null), 2000);
        } catch (err) {
            console.error('Failed to copy row:', err);
        }
    }, []);

    /**
     * Handles starting cell edit mode when a cell is clicked
     */
    const handleCellClick = useCallback((rowId: string | number, column: string, value: CellValue) => {
        setEditingCell({
            rowId,
            column,
            value,
            tempValue: value
        });
    }, []);

    /**
     * Updates the temporary value during cell editing
     */
    const handleCellEdit = useCallback((value: CellValue) => {
        setEditingCell(prev => prev ? { ...prev, tempValue: value } : null);
    }, []);

    /**
     * Confirms and saves cell edits
     */
    const handleCellUpdate = useCallback(async (pkValue: string | number, column: string, value: CellValue) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows/${pkValue}/cells/${column}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value }),
                }
            );

            if (!response.ok) throw new Error('Failed to update cell');
            
            await queryClient.invalidateQueries({
                queryKey: ['table', tableName]
            });
            
            setEditingCell(null);
        } catch (error) {
            console.error('Failed to update cell:', error);
        }
    }, [queryClient, tableName]);

    const handleCreateRow = useCallback(async (data: Record<string, CellValue>) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create row');
            await queryClient.invalidateQueries({ queryKey: ['table', tableName] });
        } catch (error) {
            throw error;
        }
    }, [queryClient, tableName]);

    const handleUpdateRow = useCallback(async (id: string, data: Record<string, CellValue>) => {
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
            await queryClient.invalidateQueries({ queryKey: ['table', tableName] });
        } catch (error) {
            throw error;
        }
    }, [queryClient, tableName]);

    const handleDeleteRow = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this row?')) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableName}/rows/${id}`,
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error('Failed to delete row');
            await queryClient.invalidateQueries({ queryKey: ['table', tableName] });
        } catch (error) {
            console.error('Failed to delete row:', error);
        }
    }, [queryClient, tableName]);

    // Toggle actions column visibility
    const handleActionsColumnToggle = () => {
        setActionsColumnVisible(!actionsColumnVisible);
    };

    // Loading and error states
    if (schemaLoading || dataLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading table data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-400">Error: {error.message}</p>
            </div>
        );
    }

    if (!tableData?.rows || !schemaData) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
            </div>
        );
    }

    // Filter and sort rows
    const filteredRows = (tableData.rows as TableRow[]).filter(row => 
        !searchText || Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    const sortedRows = [...filteredRows].sort((a, b) => {
        if (!sortConfig.column || !sortConfig.direction) return 0;
        
        const aValue = a[sortConfig.column];
        const bValue = b[sortConfig.column];

        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        return sortConfig.direction === 'asc' 
            ? aValue > bValue ? 1 : -1
            : aValue < bValue ? 1 : -1;
    });

    const totalPages = Math.ceil((tableData.totalCount || 0) / pageSize);

    return (
        <div className="flex flex-col w-full h-full">
            {/* Add New Row button */}
            <div className="mb-4">
                <button
                    onClick={() => setEditDialog({ isOpen: true, mode: 'create' })}
                    className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                    <span className="mr-2">+</span>
                    Add New Row
                </button>
            </div>

            <TableToolbar
                columns={schemaData.columns}
                searchText={searchText}
                showColumnMenu={showColumnMenu}
                showHighlightMenu={showHighlightMenu}
                selectedColumn={selectedColumn}
                columnVisibility={columnVisibility}
                isLoading={dataLoading}
                actionsColumnVisible={actionsColumnVisible}
                onSearchChange={setSearchText}
                onColumnMenuToggle={() => {
                    setShowColumnMenu(!showColumnMenu);
                    setShowHighlightMenu(false);
                }}
                onHighlightMenuToggle={() => {
                    setShowHighlightMenu(!showHighlightMenu);
                    setShowColumnMenu(false);
                }}
                onColumnVisibilityChange={handleColumnVisibilityChange}
                onColumnSelect={setSelectedColumn}
                onHighlightColor={(color) => {
                    if (selectedColumn) {
                        filteredRows.forEach(row => {
                            // Ensure row.id is string or number
                            const rowId = String(row.id);
                            handleHighlightCell(rowId, selectedColumn, color);
                        });
                    }
                }}
                onClearHighlights={handleClearHighlights}
                onReload={() => {
                    queryClient.invalidateQueries({ queryKey: ['schema', tableName] });
                    queryClient.invalidateQueries({ queryKey: ['table', tableName] });
                }}
                onActionsColumnToggle={handleActionsColumnToggle}
            />

            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 border border-gray-200 border-collapse" style={{ tableLayout: 'fixed' }}>
                    <TableHeader
                        columns={schemaData?.columns || []}
                        columnVisibility={columnVisibility}
                        columnTextWrapping={columnTextWrapping}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onTextWrappingChange={handleTextWrappingChange}
                        onColumnResize={handleColumnResize}
                        columnWidths={columnWidths}
                        actionsColumnVisible={actionsColumnVisible}
                    />

                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedRows.map((row) => (
                            <TableRow
                                key={String(row.id)}
                                row={row}
                                columns={schemaData?.columns || []}
                                columnVisibility={columnVisibility}
                                columnTextWrapping={columnTextWrapping}
                                highlightedCells={highlightedCells}
                                editingCell={editingCell}
                                copiedCell={copiedCell}
                                onCopyRow={() => handleCopyRow(row)}
                                onEditRow={() => setEditDialog({ isOpen: true, mode: 'edit', data: row })}
                                onDeleteRow={() => handleDeleteRow(String(row.id))}
                                onEditCell={handleCellEdit}
                                onCellEditConfirm={() => {
                                    if (editingCell && editingCell.rowId === row.id) {
                                        handleCellUpdate(String(row.id), editingCell.column, editingCell.tempValue);
                                    }
                                }}
                                onCellEditCancel={() => setEditingCell(null)}
                                onCellClick={handleCellClick}
                                columnWidths={columnWidths}
                                actionsColumnVisible={actionsColumnVisible}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <TablePagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                pageInput={pageInput}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setTableState(prev => ({ ...prev, pageSize: size }));
                    setPage(0);
                }}
                onPageInputChange={setPageInput}
                onPageSubmit={(e) => {
                    e.preventDefault();
                    const newPage = parseInt(pageInput, 10);
                    if (isNaN(newPage)) {
                        setPageInput((page + 1).toString());
                        return;
                    }

                    if (newPage < 1) {
                        setPage(0);
                        setPageInput("1");
                    } else if (newPage > totalPages) {
                        setPage(totalPages - 1);
                        setPageInput(totalPages.toString());
                    } else {
                        setPage(newPage - 1);
                    }
                }}
            />

            {editDialog.isOpen && schemaData && (
                <EditRowDialog
                    isOpen={editDialog.isOpen}
                    onClose={() => setEditDialog({ isOpen: false, mode: 'create' })}
                    onSave={async (data) => {
                        if (editDialog.mode === 'create') {
                            await handleCreateRow(data);
                        } else if (editDialog.data?.id) {
                            await handleUpdateRow(String(editDialog.data.id), data);
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