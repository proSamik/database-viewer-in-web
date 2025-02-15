import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Database Viewer',
    description: 'A web-based database visualization tool',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full bg-gray-50">
            <body className={`${inter.className} h-full`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
} 