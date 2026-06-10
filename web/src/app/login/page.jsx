'use client'

import { useState } from 'react'
import { loginAction } from '../actions/auth'
import { AuthCard, FormInput, FormButton, AuthLink } from '@/components/auth'
import { Logo, ErrorAlert } from '@/components/shared'

/**
 * Page de connexion utilisateur
 * 
 * @returns {JSX.Element}
 */
export default function LoginPage() {
  const [error, setError] = useState(null)
  
  const handleSubmit = async (formData) => {
    setError(null)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
    }
  }
  
  return (
    <AuthCard>
      <Logo />
      
      <ErrorAlert error={error} />
      
      <form action={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-5">
          <FormInput
            id="mail"
            name="mail"
            type="email"
            required
            placeholder="prenom@broussaud.fr"
          />
          
          <FormInput
            id="mdp"
            name="mdp"
            type="password"
            required
            placeholder="••••••••"
          />
        </div>
        
        <FormButton type="submit">
          Se connecter
        </FormButton>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-neutral-400">
          Pas encore de compte ?{' '}
          <AuthLink href="/register">Créer un compte</AuthLink>
        </p>
      </div>
    </AuthCard>
  )
}
