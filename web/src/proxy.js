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
  
  // Vérifier le mode maintenance
  const { data: modeData } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single()
  
  const isMaintenance = modeData?.value === 'true' || false
  
  // Si mode maintenance est activé
  if (isMaintenance) {
    // Vérifier si l'utilisateur est admin
    let isAdmin = false
    
    if (user) {
      const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = dbUser?.role || 'USER'
      isAdmin = role === 'ADMIN'
    }
    
    // Si pas admin, rediriger vers /maintenance sauf si déjà sur /maintenance ou /login
    if (!isAdmin) {
      const path = request.nextUrl.pathname
      const allowedPaths = ['/maintenance', '/login', '/register', '/verify-totp']
      
      // Si l'utilisateur essaie d'accéder à une page autre que celles autorisées
      if (!allowedPaths.some(p => path.startsWith(p))) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    }
  }
  
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}