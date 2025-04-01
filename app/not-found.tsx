"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a GitHub Pages environment
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      // Extract the path from URL
      const path = window.location.pathname.replace('/newOper-Dash/', '');
      
      // If we're at root but not at index
      if (path === '' || path === '/') {
        router.push('/newOper-Dash');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9e2fe] p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
} 