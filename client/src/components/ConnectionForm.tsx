'use client';

import { useState, useEffect } from 'react';
import { ConnectionConfig, ConnectionType } from '@/types';

interface Props {
    onSubmit: (config: ConnectionConfig) => Promise<void>;
    initialValues?: ConnectionConfig;
    disabled?: boolean;
}

/**
 * Form component for database connection configuration
 */
export function ConnectionForm({ onSubmit, initialValues, disabled = false }: Props) {
    const [connectionType, setConnectionType] = useState<ConnectionType>(initialValues?.type || 'ngrok');
    const [formData, setFormData] = useState<ConnectionConfig>(initialValues || {
        url: '',
        username: '',
        password: '',
        database: '',
        type: 'ngrok'
    });

    // Update form data when initialValues change
    useEffect(() => {
        if (initialValues) {
            setFormData(initialValues);
            setConnectionType(initialValues.type);
        }
    }, [initialValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleTypeChange = (type: ConnectionType) => {
        setConnectionType(type);
        setFormData(prev => ({
            ...prev,
            type,
            ...(type === 'direct' ? {
                username: '',
                password: '',
                database: ''
            } : {})
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Connection Type Selection */}
            <div className="flex space-x-4 mb-4">
                <button
                    type="button"
                    onClick={() => handleTypeChange('ngrok')}
                    disabled={disabled}
                    className={`flex-1 py-2 px-4 rounded-md ${
                        connectionType === 'ngrok'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Ngrok URL
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeChange('direct')}
                    disabled={disabled}
                    className={`flex-1 py-2 px-4 rounded-md ${
                        connectionType === 'direct'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Direct Database URL
                </button>
            </div>

            {connectionType === 'direct' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Database URL
                    </label>
                    <input
                        type="text"
                        value={formData.url || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                        required
                        disabled={disabled}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="postgresql://username:password@host:port/database"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Example: postgresql://postgres:password@junction.proxy.rlwy.net:53661/railway
                    </p>
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Database URL (ngrok)
                        </label>
                        <input
                            type="text"
                            value={formData.url || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            required
                            disabled={disabled}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., 3fd6-2401-4900-76ea-aeb4-9805-844f-6bd2.ngrok-free.app"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            value={formData.username || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            required
                            disabled={disabled}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={formData.password || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                            disabled={disabled}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Database Name
                        </label>
                        <input
                            type="text"
                            value={formData.database || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, database: e.target.value }))}
                            required
                            disabled={disabled}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </>
            )}

            <button
                type="submit"
                disabled={disabled}
                className={`w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {initialValues ? 'Update Connection' : 'Connect'}
            </button>
        </form>
    );
} 