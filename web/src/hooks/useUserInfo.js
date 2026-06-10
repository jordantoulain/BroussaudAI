'use client'

import { useState, useEffect } from 'react'

/**
 * Hook pour récupérer les informations de l'utilisateur depuis le JWT
 * @returns {{ userInfo: {nom: string, prenom: string, mail: string, role: string}, loading: boolean, error: Error|null }} 
 */
export function useUserInfo() {
  const [userInfo, setUserInfo] = useState({ nom: '', prenom: '', mail: '', role: 'USER' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const data = await response.json()
          setUserInfo({
            nom: data.nom || '',
            prenom: data.prenom || '',
            mail: data.mail || '',
            role: data.role || 'USER'
          })
        } else {
          throw new Error('Failed to fetch user info')
        }
      } catch (e) {
        console.error('Failed to fetch user info', e)
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetchUserInfo()
  }, [])
  
  return { userInfo, loading, error }
}
