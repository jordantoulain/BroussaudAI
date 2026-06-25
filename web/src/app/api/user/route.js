import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // On récupère les infos fraîches depuis la base de données
  const { data: dbUser } = await supabase
    .from('users')
    .select('nom, prenom, role')
    .eq('id', user.id)
    .single()

  // Fallback sur les métadonnées au cas où la synchro DB ait un léger délai
  const meta = user.user_metadata || {}

  return NextResponse.json({
    nom: dbUser?.nom || meta.nom || '',
    prenom: dbUser?.prenom || meta.prenom || '',
    mail: user.email || '',
    role: dbUser?.role || 'USER'
  })
}