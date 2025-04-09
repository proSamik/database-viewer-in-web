'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
            &larr; Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">Terms of Service</h1>
          <div className="mt-6 text-lg leading-8 text-gray-300">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="mt-8 text-2xl font-bold text-white">1. Agreement to Terms</h2>
            <p className="mt-4">
              By accessing or using DBViewer, you agree to be bound by these Terms of Service. If you disagree 
              with any part of the terms, you may not access the service.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">2. Use License</h2>
            <p className="mt-4">
              Permission is granted to temporarily use DBViewer for personal or commercial database management 
              purposes, subject to the following restrictions:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>You must not modify or copy the materials</li>
              <li>You must not use the materials for any unlawful purpose</li>
              <li>You must not attempt to reverse engineer any software contained in DBViewer</li>
              <li>You must not remove any copyright or proprietary notations</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-white">3. Disclaimer</h2>
            <p className="mt-4">
              The materials on DBViewer are provided on an &apos;as is&apos; basis. DBViewer makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without 
              limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
              or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">4. Limitations</h2>
            <p className="mt-4">
              In no event shall DBViewer or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or 
              inability to use DBViewer.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">5. Revisions</h2>
            <p className="mt-4">
              DBViewer may revise these terms of service at any time without notice. By using this service, you 
              are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">6. Contact</h2>
            <p className="mt-4">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:terms@dbviewer.com" className="text-blue-500 hover:text-blue-400">
                terms@dbviewer.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 