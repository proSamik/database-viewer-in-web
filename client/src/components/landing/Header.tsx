import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg 
              className="h-8 w-8 text-blue-500" 
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {/* Add your logo SVG here */}
            </svg>
            <span className="text-xl font-bold">DBViewer</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link href="#demo" className="text-gray-300 hover:text-white transition">
              Demo
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-300 hover:text-white transition">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/console" className="text-gray-300 hover:text-white transition">
              Sign In
            </Link>
            <Button variant="primary">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 