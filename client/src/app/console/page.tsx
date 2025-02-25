'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectionConfig } from '@/types';
import { DataTable } from '@/components/table/DataTable';
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
            // Determine the endpoint based on connection type
            const endpoint = config.type === 'direct' 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/connect/direct`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/connect`;

            // Prepare the payload based on connection type
            const payload = config.type === 'direct' 
                ? { url: config.url }
                : config;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
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
            await verifyConnection(config);
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
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Table Selection Dropdown */}
                        <select
                            value={selectedTable || ''}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a table</option>
                            {tables?.tables.map((table) => (
                                <option key={table} value={table}>
                                    {table}
                                </option>
                            ))}
                        </select>

                        <h1 className="text-xl font-bold text-white">
                            {selectedTable ? `Table: ${selectedTable}` : 'Database Console'}
                        </h1>
                    </div>

                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Loading tables...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-red-400">Error: {error.message}</p>
                    </div>
                ) : selectedTable ? (
                    <DataTable
                        tableName={selectedTable}
                        onReset={handleReset}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Select a table to view its data</p>
                    </div>
                )}
            </div>
        </div>
    );
} 