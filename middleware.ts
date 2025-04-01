import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockNotifications } from './app/api/notifications/mock-data';

// Middleware function to handle API requests in static export mode
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle notifications API
  if (pathname.startsWith('/api/notifications')) {
    if (request.method === 'GET') {
      return NextResponse.json({ notifications: mockNotifications });
    }
    if (request.method === 'POST') {
      return NextResponse.json({ success: true });
    }
  }

  // For other API routes, return a mock response
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: true, message: 'Static API mock response' });
  }

  return NextResponse.next();
}

// Configure the paths for middleware to run on
export const config = {
  matcher: ['/api/:path*'],
}; 