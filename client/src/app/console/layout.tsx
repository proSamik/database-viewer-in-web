'use client';

/**
 * Layout component for the console section
 * Provides strict viewport width constraints for all content
 * Prevents any horizontal overflow by using fixed width and overflow handling
 */
export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* The ConsoleHeader is now included in the page component */}
            <main className="h-screen overflow-hidden">
                <div className="h-full overflow-auto">
                    <div className="w-screen max-w-full overflow-x-hidden">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
} 