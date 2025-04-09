'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

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
            {/* Navigation Bar */}
            <nav className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-xl font-bold text-white">DBViewer</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Link href="/">
                                <Button variant="outline" size="sm" className="text-gray-300 hover:text-white">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="h-[calc(100vh-4rem)]">
                <div className="h-full overflow-auto">
                    <div className="max-w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
} 