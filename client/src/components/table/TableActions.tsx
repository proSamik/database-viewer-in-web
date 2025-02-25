import { ClipboardIcon, CheckIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface TableActionsProps {
    rowId: string | number;
    copiedCell: string | null;
    onCopy: () => void;
    onEdit: () => void;
    onDelete: () => void;
    className?: string;
}

/**
 * Renders action buttons for a table row (copy, edit, delete)
 */
export function TableActions({
    rowId,
    copiedCell,
    onCopy,
    onEdit,
    onDelete,
    className = ''
}: TableActionsProps) {
    return (
        <td className={`w-24 px-4 py-4 sticky left-0 bg-white z-10 ${className}`}>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onCopy}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Copy row"
                >
                    {copiedCell === `row-${rowId}` ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                        <ClipboardIcon className="h-4 w-4 text-gray-500" />
                    )}
                </button>
                <button
                    onClick={onEdit}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit row"
                >
                    <PencilIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button
                    onClick={onDelete}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete row"
                >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                </button>
            </div>
        </td>
    );
} 