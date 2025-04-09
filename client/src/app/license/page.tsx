'use client';

import Link from 'next/link';

export default function License() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-500 hover:text-blue-400">
            &larr; Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">MIT License</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-6">Copyright (c) {new Date().getFullYear()} DBViewer</p>
          
          <p className="mb-6">
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
          </p>
          
          <p className="mb-6">
            The above copyright notice and this permission notice shall be included in all
            copies or substantial portions of the Software.
          </p>
          
          <p className="mb-6">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Third-Party Licenses</h2>
          <p>
            DBViewer uses several open-source libraries and tools. We are grateful to the developers of these projects:
          </p>
          
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Next.js</strong> - MIT License
            </li>
            <li>
              <strong>React</strong> - MIT License
            </li>
            <li>
              <strong>Tailwind CSS</strong> - MIT License
            </li>
            <li>
              <strong>Go</strong> - BSD 3-Clause License
            </li>
            <li>
              <strong>PostgreSQL</strong> - PostgreSQL License
            </li>
          </ul>
          
          <p>
            For the full license texts of these dependencies, please refer to their respective repositories.
          </p>
        </div>
      </div>
    </div>
  );
} 