export interface ConnectionConfig {
    url: string;
    username: string;
    password: string;
    database: string;
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
    rows: Record<string, any>[];
}

export interface DatabaseError {
    message: string;
    code?: string;
}

export type ConnectionType = 'ngrok' | 'direct'; 