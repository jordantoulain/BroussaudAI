'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerAction } from '../actions/auth'
import { AuthCard, ErrorAlert, FormInput, FormButton, AuthLink, FormRow } from '@/components/auth'
import { Logo } from '@/components/shared'

/**
 * Page d'inscription utilisateur
 * 
 * @returns {JSX.Element}
 */
export default function RegisterPage() {
  const [error, setError] = useState(null)
  const router = useRouter()
  
  const handleSubmit = async (formData) => {
    setError(null)
    const result = await registerAction(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      router.push('/login')
    }
  }
  
  return (
    <AuthCard>
      <Logo />
      
      <ErrorAlert error={error} />
      
      <form action={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-5">
          <FormRow>
            <FormInput
              id="prenom"
              name="prenom"
              type="text"
              required
              placeholder="Prénom"
            />
            <FormInput
              id="nom"
              name="nom"
              type="text"
              required
              placeholder="Nom"
            />
          </FormRow>
          
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
          S'inscrire
        </FormButton>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-neutral-400">
          Déjà un compte ?{' '}
          <AuthLink href="/login">Se connecter</AuthLink>
        </p>
      </div>
    </AuthCard>
  )
}
