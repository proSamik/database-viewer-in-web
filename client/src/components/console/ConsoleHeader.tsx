'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HomeIcon } from '@heroicons/react/24/outline';
import { ConnectionConfig } from '@/types';
import { ConnectionForm } from '@/components/ConnectionForm';

interface ConsoleHeaderProps {
  connectionConfig: ConnectionConfig | null;
  onUpdateConnection: (config: ConnectionConfig) => Promise<void>;
}

/**
 * Header component for the console page with database connection management
 */
export function ConsoleHeader({ connectionConfig, onUpdateConnection }: ConsoleHeaderProps) {
  const [showConnectionForm, setShowConnectionForm] = useState(false);

  /**
   * Handles the connection form submission
   */
  const handleConnectionUpdate = async (config: ConnectionConfig) => {
    try {
      await onUpdateConnection(config);
      setShowConnectionForm(false);
    } catch (error) {
      console.error('Failed to update connection:', error);
    }
  };

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
            {connectionConfig && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowConnectionForm(!showConnectionForm)}
              >
                Change Database
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Form Modal */}
      {showConnectionForm && connectionConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Change Database Connection</h2>
              <button 
                onClick={() => setShowConnectionForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <ConnectionForm 
              onSubmit={handleConnectionUpdate} 
              initialValues={connectionConfig || {}} // Provide a default value to avoid TypeScript error
            />
          </div>
        </div>
      )}
    </header>
  );
}