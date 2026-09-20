import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Let the application handle authentication via /admin/login page and sessions.
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
