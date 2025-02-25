'use client';

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* The ConsoleHeader is now included in the page component */}
            <main className="h-screen">
                {children}
            </main>
        </div>
    );
} 