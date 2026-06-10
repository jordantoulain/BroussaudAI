import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'Aucun refresh token' }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!res.ok) {
      const response = NextResponse.json({ error: 'Refresh échoué' }, { status: 401 })
      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      return response
    }

    const data = await res.json()
    const response = NextResponse.json({ success: true, access_token: data.access_token })
    
    response.cookies.set('access_token', data.access_token, {
      path: '/',
      maxAge: 5 * 60,
      httpOnly: false 
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 })
  }
}