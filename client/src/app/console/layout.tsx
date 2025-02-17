import { ConsoleHeader } from '@/components/console/ConsoleHeader';

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900">
            <ConsoleHeader />
            <main className="py-4">
                {children}
            </main>
        </div>
    );
} 