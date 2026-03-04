import { NextResponse } from 'next/server'

const publicPaths = ['/login']

// Role-based route access
const roleRoutes = {
  ADMIN: ['/admin', '/patients', '/visits', '/packages', '/reports', '/departments'],
  DOCTOR: ['/departments/doctor', '/visits', '/patients', '/reports'],
  NURSE: ['/departments/nursing', '/visits', '/patients'],
  LAB: ['/departments/laboratory', '/visits'],
  RADIOLOGY: ['/departments/radiology', '/visits'],
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const token = request.cookies.get('session')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Decode JWT (base64url decode payload)
    // Go backend uses HS256, we just need to extract the payload for role checking
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    const role = payload.role

    // Check role-based access
    const allowedRoutes = roleRoutes[role] || []

    // Check if user has access to this route
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))

    if (!hasAccess && pathname !== '/') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
