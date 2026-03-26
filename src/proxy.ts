import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const role = request.cookies.get('auth_role')?.value;

  // Protect Admin APIs
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 })
    }
  }

  // Protect Calendar APIs (Admin only for now, per specs)
  if (request.nextUrl.pathname.startsWith('/api/calendar') && request.method !== 'GET') {
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/calendar/:path*'],
}
