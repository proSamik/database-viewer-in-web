import { ConsoleHeader } from '@/components/console/ConsoleHeader';

export default function ConsoleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900">
            <ConsoleHeader />
            <main className="h-[calc(100vh-4rem)]">
                {children}
            </main>
        </div>
    );
} 