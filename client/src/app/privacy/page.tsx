'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
            &larr; Back to home
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">Privacy Policy</h1>
          <div className="mt-6 text-lg leading-8 text-gray-300">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="mt-8 text-2xl font-bold text-white">1. Introduction</h2>
            <p className="mt-4">
              Welcome to DBViewer. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our 
              website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">2. Data We Collect</h2>
            <p className="mt-4">
              We collect and process the following data:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Connection information (host, port, database name)</li>
              <li>Usage data (features accessed, time spent)</li>
              <li>Technical data (IP address, browser type, device information)</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-white">3. How We Use Your Data</h2>
            <p className="mt-4">
              We use your data to:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve and personalize your experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect and prevent technical issues</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-white">4. Data Security</h2>
            <p className="mt-4">
              We implement appropriate security measures to protect your data. However, no method of transmission 
              over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="mt-8 text-2xl font-bold text-white">5. Your Rights</h2>
            <p className="mt-4">
              You have the right to:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
            </ul>

            <h2 className="mt-8 text-2xl font-bold text-white">6. Contact Us</h2>
            <p className="mt-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
              <br />
              <a href="mailto:privacy@dbviewer.com" className="text-blue-500 hover:text-blue-400">
                privacy@dbviewer.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 