import { format } from 'date-fns';
import { CellValue, TableSchema, Column } from '@/types/TableViewerTypes';

// Format date as DD MMM YY
export const formatDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    try {
        const date = new Date(dateStr);
        return format(date, 'dd MMM yy');
    } catch {
        return dateStr;
    }
};

// Convert PostgreSQL types to column types
export const getColumnType = (pgType: string): 'string' | 'number' | 'boolean' => {
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

// Transform data with proper date formatting
export const transformData = (rows: Record<string, CellValue>[], schema: TableSchema): Record<string, CellValue>[] => {
    return rows.map(row => {
        const transformedRow = { ...row };
        schema.columns.forEach((col: Column) => {
            if (col.dataType.toLowerCase().includes('timestamp') || col.dataType.toLowerCase() === 'date') {
                transformedRow[col.name] = row[col.name] ? formatDate(String(row[col.name])) : null;
            }
        });
        return transformedRow;
    });
};

// Get primary key column from schema
export const getPrimaryKeyColumn = (schema: TableSchema): string => {
    return schema.columns.find((col: Column) => col.isPrimary)?.name || 'id';
};

// Format cell value based on data type
export const formatCellValue = (value: CellValue, dataType: string): string => {
    if (value === null) return '-';

    switch (dataType.toLowerCase()) {
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'timestamp':
        case 'date':
            return formatDate(String(value)) || '-';
        case 'boolean':
            return value ? 'Yes' : 'No';
        default:
            return String(value);
    }
};

// Get input type based on data type
export const getInputType = (dataType: string): string => {
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
};

// Check if column is timestamp type
export const isTimestampType = (dataType: string): boolean => {
    const type = dataType.toLowerCase();
    return type.includes('timestamp') || type === 'date';
};

// Get default value for non-nullable fields
export const getDefaultValue = (dataType: string): CellValue => {
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
};

// Get CSS class for text wrapping
export const getWrappingClass = (wrapping: 'wrap' | 'truncate'): string => {
    switch (wrapping) {
        case 'wrap':
            return 'whitespace-normal break-words';
        case 'truncate':
            return 'truncate overflow-hidden text-ellipsis';
        default:
            return 'truncate overflow-hidden text-ellipsis';
    }
}; 