'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const [isEditingDatabase, setIsEditingDatabase] = useState(false);
    const [databaseName, setDatabaseName] = useState('');
    const [databaseError, setDatabaseError] = useState<string | null>(null);
    const databaseInputRef = useRef<HTMLInputElement>(null);
    const [isUpdatingDatabase, setIsUpdatingDatabase] = useState(false);
    const queryClient = useQueryClient();

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

    // Add function to handle database name change
    const handleDatabaseChange = async () => {
        if (!connectionConfig || connectionConfig.type !== 'ngrok' || !databaseName.trim()) {
            return;
        }

        // Don't do anything if the database name hasn't changed
        if (databaseName.trim() === connectionConfig.database) {
            setIsEditingDatabase(false);
            return;
        }

        setIsUpdatingDatabase(true);
        setDatabaseError(null);

        try {
            // Create updated config
            const updatedConfig: ConnectionConfig = {
                ...connectionConfig,
                database: databaseName.trim()
            };

            // Verify the updated connection
            await verifyConnection(updatedConfig);
            
            // If successful, update the stored config
            setConnectionConfig(updatedConfig);
            setIsEditingDatabase(false);
            
            // Reset selected table since we're connecting to a new database
            setSelectedTable(null);
            
            // Invalidate and refetch the tables query
            queryClient.invalidateQueries({ queryKey: ['tables'] });
        } catch (error) {
            console.error('Database update error:', error);
            setDatabaseError('Failed to connect with the new database name');
        } finally {
            setIsUpdatingDatabase(false);
        }
    };

    // Initialize database name from config
    useEffect(() => {
        if (connectionConfig?.database) {
            setDatabaseName(connectionConfig.database);
        }
    }, [connectionConfig]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingDatabase && databaseInputRef.current) {
            databaseInputRef.current.focus();
        }
    }, [isEditingDatabase]);

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
                            {tables && tables.tables && tables.tables.map((table) => (
                                <option key={table} value={table}>
                                    {table}
                                </option>
                            ))}
                        </select>

                        <h1 className="text-xl font-bold text-white">
                            {selectedTable ? `Table: ${selectedTable}` : 'Database Console'}
                        </h1>
                        
                        {/* Database name display and edit for ngrok connections */}
                        {connectionConfig?.type === 'ngrok' && (
                            <div className="flex items-center ml-4">
                                <span className="text-gray-400 mr-2">Database:</span>
                                {isEditingDatabase ? (
                                    <div className="flex items-center">
                                        <input
                                            ref={databaseInputRef}
                                            type="text"
                                            value={databaseName}
                                            onChange={(e) => setDatabaseName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleDatabaseChange();
                                                } else if (e.key === 'Escape') {
                                                    setIsEditingDatabase(false);
                                                    setDatabaseName(connectionConfig.database);
                                                    setDatabaseError(null);
                                                }
                                            }}
                                            onBlur={handleDatabaseChange}
                                            disabled={isUpdatingDatabase}
                                            className="px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                                        />
                                        {isUpdatingDatabase && (
                                            <span className="ml-2 text-blue-400 text-sm">Connecting...</span>
                                        )}
                                    </div>
                                ) : (
                                    <div 
                                        className="flex items-center cursor-pointer group"
                                        onClick={() => setIsEditingDatabase(true)}
                                    >
                                        <span className="text-white font-medium">{connectionConfig.database}</span>
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-4 w-4 ml-1 text-gray-400 group-hover:text-white" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Display database error if any */}
                        {databaseError && (
                            <span className="text-red-400 text-sm ml-2">{databaseError}</span>
                        )}
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