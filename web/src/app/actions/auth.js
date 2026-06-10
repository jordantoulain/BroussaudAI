'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function loginAction(formData) {
  const mail = formData.get('mail')
  const mdp = formData.get('mdp')

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
    return { error: "Erreur réseau. Le serveur API n'est pas accessible." }
  }

  redirect('/chat')
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
    return { error: "Erreur réseau. Le serveur API n'est pas accessible." }
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