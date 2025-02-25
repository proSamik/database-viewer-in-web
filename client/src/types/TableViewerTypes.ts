import { TableSchema as BaseTableSchema } from '@/types';

export interface Column {
    name: string;
    dataType: string;
    isNullable: boolean;
    isPrimary: boolean;
}

export interface TableSchema extends BaseTableSchema {
    columns: Column[];
}

export type ColumnVisibility = Record<string, boolean>;
export type ColumnWidth = Record<string, number>;
export type TextWrapping = Record<string, 'wrap' | 'truncate' | 'normal'>;
export type SortDirection = 'asc' | 'desc' | null;

export interface TableViewerProps {
    tableName: string;
    onReset: () => void;
}

export interface TableResponse {
    rows: Record<string, CellValue>[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface EditDialogState {
    isOpen: boolean;
    mode: 'create' | 'edit';
    data?: Record<string, CellValue>;
}

export interface EditingCellState {
    rowId: string | number;
    column: string;
    value: CellValue;
    tempValue: CellValue;
}

export interface SortConfig {
    column: string | null;
    direction: SortDirection;
}

export type CellValue = string | number | boolean | Date | null;

export interface TableViewerState {
    columnVisibility: ColumnVisibility;
    columnWidths: ColumnWidth;
    columnTextWrapping: TextWrapping;
    pageSize: number;
    selectedTable: string;
} 