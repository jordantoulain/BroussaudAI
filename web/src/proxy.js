import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request) {
  // Création d'une réponse modifiable pour que Supabase puisse rafraîchir les cookies si besoin
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Récupération de l'utilisateur actif
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protection /chat
  if (request.nextUrl.pathname.startsWith('/chat') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Protection /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // On va chercher le rôle directement dans ta table publique users
    const { data: dbUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const role = dbUser?.role || 'USER'
    
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/chat(:/?)', '/admin/:path*'],
}