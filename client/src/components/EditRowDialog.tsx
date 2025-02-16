import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { TableSchema } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Record<string, any>) => Promise<void>;
    schema: TableSchema;
    initialData?: Record<string, any>;
    mode: 'create' | 'edit';
}

export function EditRowDialog({ isOpen, onClose, onSave, schema, initialData, mode }: Props) {
    const [formData, setFormData] = useState<Record<string, any>>(initialData || {});
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
                    <Dialog.Title className="text-lg font-medium mb-4">
                        {mode === 'create' ? 'Add New Row' : 'Edit Row'}
                    </Dialog.Title>

                    {error && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {schema.columns.map(column => (
                            <div key={column.name} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    {column.name}
                                </label>
                                <input
                                    type={getInputType(column.dataType)}
                                    value={formData[column.name] || ''}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            [column.name]: e.target.value
                                        }));
                                    }}
                                    required={!column.isNullable}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}

                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md border"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}

function getInputType(dataType: string): string {
    switch (dataType.toLowerCase()) {
        case 'integer':
        case 'bigint':
        case 'smallint':
            return 'number';
        case 'boolean':
            return 'checkbox';
        case 'date':
            return 'date';
        case 'timestamp with time zone':
        case 'timestamp without time zone':
        case 'timestamp':
            return 'datetime-local';
        default:
            return 'text';
    }
} 