'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConnectionConfig, ConnectionType } from '@/types';
import { TableViewer } from '@/components/TableViewer';
import { Check, Close, Edit } from '@mui/icons-material';
import { usePersistedState } from '@/hooks/usePersistedState';
import { ConnectionForm } from '@/components/ConnectionForm';

interface TablesResponse {
    tables: string[];
}

export default function Home() {
    const [isConnected, setIsConnected] = usePersistedState('isConnected', false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [formData, setFormData] = usePersistedState<ConnectionConfig>('connectionConfig', {
        url: '',
        username: '',
        password: '',
        database: ''
    });
    const [editingDatabase, setEditingDatabase] = useState(false);
    const [tempDatabase, setTempDatabase] = useState('');

    // Query for fetching tables
    const { data: tablesData, isLoading: tablesLoading } = useQuery<TablesResponse>({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables`);
            if (!response.ok) throw new Error('Failed to fetch tables');
            return response.json();
        },
        enabled: isConnected,
    });

    const handleDatabaseEdit = () => {
        setEditingDatabase(true);
        setTempDatabase(formData.database);
    };

    const handleDatabaseChange = async (confirm: boolean) => {
        if (!confirm) {
            setEditingDatabase(false);
            setTempDatabase('');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, database: tempDatabase }),
            });

            if (!response.ok) throw new Error('Failed to switch database');

            setFormData(prev => ({ ...prev, database: tempDatabase }));
            setSelectedTable('');
            setEditingDatabase(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to switch database');
            setTempDatabase(formData.database);
        } finally {
            setEditingDatabase(false);
        }
    };

    const handleReset = () => {
        setIsConnected(false);
        setSelectedTable('');
        setError(null);
        setFormData({
            url: '',
            username: '',
            password: '',
            database: ''
        });
    };

    const handleConnect = async (config: ConnectionConfig, type: ConnectionType) => {
        setError(null);

        try {
            const endpoint = type === 'direct' ? '/api/connect/direct' : '/api/connect';
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect to database');
            }

            // Update form data and connection state
            setFormData(config);
            setIsConnected(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            throw err;
        }
    };

    const ConnectedView = () => (
        <div className="space-y-6 w-full">
            {/* Header Section */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Connected to Database</h2>
                <div className="flex items-center space-x-4">
                    {editingDatabase ? (
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={tempDatabase}
                                onChange={(e) => setTempDatabase(e.target.value)}
                                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button 
                                onClick={() => handleDatabaseChange(true)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                            >
                                <Check className="h-5 w-5" />
                            </button>
                            <button 
                                onClick={() => handleDatabaseChange(false)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <Close className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Database: {formData.database}</span>
                            <button 
                                onClick={handleDatabaseEdit}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                    <span className="text-gray-500">URL: {formData.url}</span>
                </div>
            </div>

            {/* Table Selection */}
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Select a Table</h3>
                {tablesLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select
                            value={selectedTable}
                            onChange={(e) => setSelectedTable(e.target.value)}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a table</option>
                            {tablesData?.tables?.map((table) => (
                                <option key={table} value={table}>{table}</option>
                            ))}
                        </select>
                        {tablesData?.tables && (
                            <p className="text-sm text-gray-500">
                                {tablesData.tables.length} tables available
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Table Viewer */}
            {selectedTable && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <TableViewer tableName={selectedTable} onReset={handleReset} />
                </div>
            )}

            {/* Reset Button */}
            <button
                onClick={handleReset}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Reset Connection
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-center mb-8">Database Viewer</h1>
                <div className="bg-white rounded-lg shadow p-6">
                    {!isConnected ? (
                        <ConnectionForm onConnect={handleConnect} />
                    ) : (
                        <ConnectedView />
                    )}
                </div>
            </div>
        </div>
    );
}
