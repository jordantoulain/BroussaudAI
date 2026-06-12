'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function loginAction(formData) {
  const mail = formData.get('mail')
  const mdp = formData.get('mdp')

  let redirectUrl = null

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mail, mdp }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Erreur de connexion" }
    }

    const data = await response.json()

    if (data.requires_mfa) {
      const params = new URLSearchParams({
        user_id: data.user_id,
        has_mfa: data.has_mfa,
        mfa_verified: data.mfa_verified
      })
      redirectUrl = `/login/mfa?${params.toString()}`
    } else {
      const cookieStore = await cookies()

      cookieStore.set('access_token', data.access_token, { 
        path: '/', 
        maxAge: 5 * 60,
        httpOnly: false 
      })
      
      cookieStore.set('refresh_token', data.refresh_token, { 
        path: '/', 
        httpOnly: true, 
        maxAge: 7 * 24 * 60 * 60,
      })

      redirectUrl = '/chat'
    }

  } catch (error) {
    return { error: "Erreur réseau. Le serveur API n'est pas accessible.", detail: error}
  }

  redirect(redirectUrl)
}

export async function registerAction(formData) {
  const nom = formData.get('nom')
  const prenom = formData.get('prenom')
  const mail = formData.get('mail')
  const mdp = formData.get('mdp')

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prenom, mail, mdp }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Erreur d'inscription" }
    }
    
    return { success: true }
  } catch (error) {
    return { error: "Erreur réseau. Le serveur API n'est pas accessible.", detail: error}
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch (error) {
      console.error("Erreur réseau lors de l'appel à l'API pour le logout")
    }
  }

  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')

  redirect('/login')
}

export async function verifyMFAAction(formData) {
  const userId = formData.get('user_id')
  const code = formData.get('code')
  const secret = formData.get('secret')

  try {
    const response = await fetch(`${API_URL}/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, code, secret: secret || undefined }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Code invalide" }
    }

    const data = await response.json()

    const cookieStore = await cookies()
    cookieStore.set('access_token', data.access_token, { 
      path: '/', 
      maxAge: 5 * 60,
      httpOnly: false 
    })
    
    cookieStore.set('refresh_token', data.refresh_token, { 
      path: '/', 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60,
    })

  } catch (error) {
    return { error: "Erreur réseau" }
  }

  redirect('/chat')
}

export async function skipMFAAction(formData) {
  const userId = formData.get('user_id')

  try {
    const response = await fetch(`${API_URL}/mfa/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.detail || "Erreur lors du skip" }
    }

    const data = await response.json()

    const cookieStore = await cookies()
    cookieStore.set('access_token', data.access_token, { 
      path: '/', 
      maxAge: 5 * 60,
      httpOnly: false 
    })
    
    cookieStore.set('refresh_token', data.refresh_token, { 
      path: '/', 
      httpOnly: true, 
      maxAge: 7 * 24 * 60 * 60,
    })

  } catch (error) {
    return { error: "Erreur réseau" }
  }

  redirect('/chat')
}