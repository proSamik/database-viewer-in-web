import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HomeIcon } from '@heroicons/react/24/outline';

export function ConsoleHeader() {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <HomeIcon className="h-6 w-6 text-gray-400 hover:text-white transition-colors" />
              <span className="text-gray-200 hover:text-white transition-colors">Home</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Connected to Database</span>
            <Button variant="secondary" size="sm">
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 