interface TablePaginationProps {
    page: number;
    pageSize: number;
    totalPages: number;
    pageInput: string;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onPageInputChange: (value: string) => void;
    onPageSubmit: (e: React.FormEvent) => void;
}

/**
 * Renders pagination controls for the table
 * Strictly respects viewport width and prevents any horizontal overflow
 * Uses a mobile-first approach with stacking controls on smaller screens
 */
export function TablePagination({
    page,
    pageSize,
    totalPages,
    pageInput,
    onPageChange,
    onPageSizeChange,
    onPageInputChange,
    onPageSubmit
}: TablePaginationProps) {
    return (
        <div className="bg-white border-t border-gray-200 w-full overflow-hidden">
            <div className="p-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                {/* Page size and page number controls */}
                <div className="flex flex-wrap items-center gap-4 py-2 px-2">
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(0);
                        }}
                        className="border border-gray-300 rounded-md text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                {size} rows
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">Page</span>
                        <form onSubmit={onPageSubmit} className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={pageInput}
                                onChange={(e) => onPageInputChange(e.target.value)}
                                onBlur={onPageSubmit}
                                className="w-16 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">of {totalPages}</span>
                        </form>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex flex-wrap items-center gap-2 px-2">
                    <button
                        onClick={() => onPageChange(0)}
                        disabled={page === 0}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="First page"
                    >
                        ««
                    </button>
                    <button
                        onClick={() => onPageChange(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Previous page"
                    >
                        «
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Next page"
                    >
                        »
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages - 1)}
                        disabled={page >= totalPages - 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        title="Last page"
                    >
                        »»
                    </button>
                </div>
            </div>
        </div>
    );
} 