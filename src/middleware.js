import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

const publicPaths = ['/login']
const authPaths = ['/login']

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

  // Verify session
  const token = request.cookies.get('session')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role

    // Check role-based access
    const allowedRoutes = roleRoutes[role] || []
    
    // Check if accessing auth paths while logged in
    if (authPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if user has access to this route
    const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))
    
    if (!hasAccess && pathname !== '/') {
      // Log permission denied (would need async logging here)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
