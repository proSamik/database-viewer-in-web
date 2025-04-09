'use client';

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-400">
            &larr; Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using DBViewer ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the Terms, you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>
            DBViewer is a web-based PostgreSQL database browser that allows users to connect to and browse PostgreSQL databases, either directly or through ngrok TCP tunnels. The Service provides features for viewing, editing, and managing database tables and data.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            To access certain features of the Service, you may be required to register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
          </p>
          <p>
            You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
          <p>
            You are solely responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>All data and content you submit, post, or display through the Service</li>
            <li>Maintaining the security of your database credentials</li>
            <li>Ensuring you have the necessary permissions to access and modify the databases you connect to</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Activities</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the Service for any illegal purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Interfere with or disrupt the Service or servers connected to the Service</li>
            <li>Use the Service to harm, threaten, or harass others</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by DBViewer and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL DBVIEWER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            Email: legal@dbviewer.com
          </p>
        </div>
      </div>
    </div>
  );
} 