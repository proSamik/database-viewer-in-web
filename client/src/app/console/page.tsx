'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectionConfig, ConnectionType } from '@/types';
import { TableViewer } from '@/components/TableViewer';
import { usePersistedState } from '@/hooks/usePersistedState';
import { ConnectionForm } from '@/components/ConnectionForm';

interface TablesResponse {
    tables: string[];
}

export default function ConsolePage() {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [connectionConfig, setConnectionConfig] = usePersistedState<ConnectionConfig | null>('connectionConfig', null);

    // Add connection verification
    const verifyConnection = useCallback(async (config: ConnectionConfig) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                setConnectionConfig(null);
                throw new Error('Connection failed');
            }
        } catch (error) {
            setConnectionConfig(null);
            console.error('Connection verification failed:', error);
        }
    }, [setConnectionConfig]);

    // Verify connection on mount if we have stored credentials
    useEffect(() => {
        if (connectionConfig) {
            verifyConnection(connectionConfig);
        }
    }, [connectionConfig, verifyConnection]);

    const { data: tables, isLoading, error } = useQuery<TablesResponse>({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables`);
            if (!response.ok) {
                throw new Error('Failed to fetch tables');
            }
            return response.json();
        },
        enabled: !!connectionConfig,
        // Add retry logic
        retry: (failureCount, error) => {
            if (error.message.includes('Connection failed')) {
                setConnectionConfig(null);
                return false;
            }
            return failureCount < 3;
        },
    });

    const handleConnect = async (config: ConnectionConfig) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error('Failed to connect');
            }

            setConnectionConfig(config);
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    };

    const handleReset = () => {
        setConnectionConfig(null);
        setSelectedTable(null);
    };

    if (!connectionConfig) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <ConnectionForm onSubmit={handleConnect} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Database Console</h1>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Disconnect
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-gray-400 py-12">
                    Loading tables...
                </div>
            ) : error ? (
                <div className="text-center text-red-400 py-12">
                    Error loading tables: {error.message}
                </div>
            ) : tables ? (
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 text-white">Tables</h2>
                        <ul className="space-y-2">
                            {tables.tables.map((table) => (
                                <li key={table}>
                                    <button
                                        onClick={() => setSelectedTable(table)}
                                        className={`w-full text-left px-3 py-2 rounded ${
                                            selectedTable === table
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {table}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        {selectedTable ? (
                            <TableViewer
                                tableName={selectedTable}
                                onReset={handleReset}
                            />
                        ) : (
                            <div className="text-center text-gray-400 py-12">
                                Select a table to view its data
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
} 