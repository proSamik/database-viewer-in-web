'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';

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

export function TableViewer({ tableName, onReset }: Props) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);

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

    return (
        <div className="flex flex-col w-full h-full">
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {schemaData.columns.map((column) => (
                                <th
                                    key={column.name}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column.name.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tableData.rows.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                                {schemaData.columns.map((column) => (
                                    <td key={column.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCellValue(row[column.name], column.name)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex items-center">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="border border-gray-300 rounded-md text-sm p-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size} rows
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">
                        Page {page + 1} of {totalPages}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
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