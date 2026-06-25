'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'

// --- 1. CONFIGURATION SUPABASE ---

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

// --- 2. FONCTION UTILITAIRE (DRY) ---

async function postLoginSetup(supabase, sessionData, userAgent) {
  // 1. Récupérer l'utilisateur de manière sécurisée
  // Si sessionData.user n'existe pas, on demande au SDK de nous donner l'utilisateur courant
  let user = sessionData?.user;
  
  if (!user) {
    const { data: { user: fetchedUser } } = await supabase.auth.getUser();
    user = fetchedUser;
  }

  // 2. Vérification de sécurité
  if (!user?.id || !sessionData?.session?.access_token) {
    console.error("❌ Impossible de configurer la session : utilisateur ou token manquant");
    return;
  }

  const token = sessionData.session.access_token;

  // A. Récupérer le rôle directement via Supabase
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id) // Maintenant user.id est garanti existant
      .single();
      
    if (dbUser?.role) {
      const cookieStore = await cookies();
      cookieStore.set('user_role', dbUser.role, { path: '/', httpOnly: true });
    } else if (error) {
      console.error("❌ Erreur Supabase lors de la lecture du rôle :", error.message);
    }
  } catch (e) {
    console.error("❌ Impossible de lire le rôle depuis la BDD :", e.message);
  }

  // B. Enregistrer l'appareil dans le backend (FastAPI)
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const sessionRes = await fetch(`${apiUrl}/sessions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ device_info: userAgent })
    });

    if (!sessionRes.ok) {
      console.error("❌ Erreur API /sessions/ :", sessionRes.status, await sessionRes.text());
    }
  } catch (e) {
    console.error("❌ Impossible de joindre l'API pour la session :", e.message);
  }
}

// --- 3. ACTIONS PRINCIPALES ---

export async function registerAction(formData) {
  const nom = formData.get('nom')?.trim()
  const prenom = formData.get('prenom')?.trim()
  const mail = formData.get('mail')?.trim().toLowerCase()
  const mdp = formData.get('mdp')

  // Validation stricte
  if (!nom || !prenom) {
    return { error: "Le nom et le prénom sont obligatoires." }
  }
  if (!mail || !mail.endsWith('@broussaud.fr')) {
    return { error: "Seuls les emails @broussaud.fr sont autorisés." }
  }
  if (mdp.length < 12) {
    return { error: "Le mot de passe doit contenir au moins 12 caractères." }
  }
  if (!/[A-Z]/.test(mdp)) {
    return { error: "Le mot de passe doit contenir au moins une majuscule." }
  }
  if (!/[a-z]/.test(mdp)) {
    return { error: "Le mot de passe doit contenir au moins une minuscule." }
  }
  if (!/[0-9]/.test(mdp)) {
    return { error: "Le mot de passe doit contenir au moins un chiffre." }
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(mdp)) {
    return { error: "Le mot de passe doit contenir au moins un caractère spécial." }
  }

  const supabase = await getSupabase()
  
  const { error } = await supabase.auth.signUp({
    email: mail,
    password: mdp,
    options: { 
      data: { nom, prenom } // Pas de rôle ici, géré par la table SQL
    }
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Cet email est déjà utilisé." }
    }
    return { error: error.message }
  }
  
  return { success: true }
}

export async function loginAction(formData) {
  const mail = formData.get('mail')
  const mdp = formData.get('mdp')
  const userAgent = formData.get('userAgent') || 'Appareil inconnu'
  let redirectUrl = null

  const supabase = await getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email: mail, password: mdp })

  if (error) return { error: "Email ou mot de passe incorrect" }

  // Vérification des niveaux de sécurité MFA de la session
  const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  
  if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
    // Cas 1 : L'utilisateur A DÉJÀ configuré le MFA -> Redirection vers la page de Saisie du code
    redirectUrl = `/login/mfa?user_id=${data.user.id}&has_mfa=true&mfa_verified=false`
    
  } else if (mfaData && mfaData.nextLevel === 'aal1') {
    // Cas 2 : L'utilisateur N'A PAS ENCORE configuré le MFA -> Redirection vers la page de SETUP (QR Code)
    redirectUrl = `/login/mfa?user_id=${data.user.id}&has_mfa=false`
    
  } else {
    // Cas 3 : L'utilisateur est déjà totalement vérifié (AAL2 complet)
    await postLoginSetup(supabase, data, userAgent)
    redirectUrl = '/chat'
  }

  if (redirectUrl) redirect(redirectUrl)
}

// --- 4. ACTIONS MFA ---

export async function getMFAEnrollmentAction() {
  const supabase = await getSupabase()
  
  // 1. On récupère les facteurs existants de l'utilisateur
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) return { error: userError.message }

  // 2. Nettoyage : On supprime les tentatives de configuration inachevées
  if (user?.factors) {
    for (const factor of user.factors) {
      if (factor.factor_type === 'totp' && factor.status === 'unverified') {
        await supabase.auth.mfa.unenroll({ factorId: factor.id })
      }
    }
  }

  // 3. Maintenant qu'on a fait place nette, on génère un tout nouveau facteur
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
  
  if (error) return { error: error.message }
  
  return {
    qr_code: data.totp.qr_code,
    secret: data.totp.secret
  }
}

export async function verifyMFAAction(formData) {
  const code = formData.get('code')
  const userAgent = formData.get('userAgent') || 'Appareil inconnu'
  const supabase = await getSupabase()
  
  const { data: { user } } = await supabase.auth.getUser()
  const totpFactor = user?.factors?.find(f => f.factor_type === 'totp')
  
  if (!totpFactor) return { error: "MFA non configuré" }
  
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
  if (challengeError) return { error: "Session expirée" }
  
  const { error } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challenge.id,
    code
  })
  
  if (error) return { error: "Code invalide" }
  
  // On récupère la session fraîche après validation
  const { data: sessionData } = await supabase.auth.getSession()
  await postLoginSetup(supabase, sessionData, userAgent)
  
  redirect('/chat')
}

export async function skipMFAAction(formData) {
  const userAgent = formData?.get('userAgent') || 'Appareil inconnu'
  const supabase = await getSupabase()
  
  const { data: sessionData } = await supabase.auth.getSession()
  await postLoginSetup(supabase, sessionData, userAgent)
  
  redirect('/chat')
}

// --- 5. DÉCONNEXION ---

export async function logoutAction() {
  const supabase = await getSupabase()
  await supabase.auth.signOut()
  
  // Nettoyage du cookie de rôle
  const cookieStore = await cookies()
  cookieStore.delete('user_role')
  
  redirect('/login')
}