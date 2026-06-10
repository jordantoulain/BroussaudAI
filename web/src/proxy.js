import { NextResponse } from 'next/server'

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request) {
  const hasAccessToken = request.cookies.has('access_token')
  const hasRefreshToken = request.cookies.has('refresh_token')
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  
  // Protection /chat
  if (request.nextUrl.pathname.startsWith('/chat') && !hasAccessToken && !hasRefreshToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Protection /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    let payload = null
    if (accessToken) {
      payload = decodeJwt(accessToken)
    } else if (refreshToken) {
      payload = decodeJwt(refreshToken)
    }
    
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const role = payload.role || 'USER'
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat(:/?)', '/admin/:path*'],
}