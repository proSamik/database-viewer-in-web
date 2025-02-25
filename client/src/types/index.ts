// Define possible cell value types
export type CellValue = string | number | boolean | Date | null;

// Define possible column types
export type ColumnType = 'string' | 'number' | 'boolean' | 'dateTime';

export interface ConnectionConfig {
    url: string;
    username: string;
    password: string;
    database: string;
    type: ConnectionType;
}

export interface TableColumn {
    field: string;
    headerName: string;
    width?: number;
    type?: string;
    editable?: boolean;
}

export interface TableData {
    columns: TableColumn[];
    rows: Record<string, CellValue>[];
}

export interface DatabaseError {
    message: string;
    code?: string;
}

export type ConnectionType = 'ngrok' | 'direct';

export interface HighlightConfig {
    column: string;
    color: string;
}

export interface TableViewerState {
    columnVisibility: Record<string, boolean>;
    columnWidths: Record<string, number>;
    columnTextWrapping: Record<string, 'wrap' | 'truncate' | 'normal'>;
    pageSize: number;
    selectedTable: string;
}

export interface TableRow {
    id: string | number;
    [key: string]: CellValue;
}

export interface TableSchema {
    columns: Array<{
        name: string;
        dataType: string;
        isNullable: boolean;
        isPrimary: boolean;
    }>;
}

export interface TableResponse {
    rows: TableRow[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface RowOperation {
    type: 'create' | 'update' | 'delete';
    status: 'pending' | 'success' | 'error';
    message?: string;
} 