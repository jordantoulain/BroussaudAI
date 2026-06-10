import { logoutAction } from '../actions/auth'
import { AuthCard, FormButton, AuthLink } from '@/components/auth'

/**
 * Page de confirmation de déconnexion
 * 
 * @returns {JSX.Element}
 */
export default function LogoutPage() {
  return (
    <AuthCard cardClassName="bg-neutral-100/90 text-center">
      <div>
        <h2 className="text-2xl font-bold text-black">
          Déconnexion
        </h2>
        <p className="mt-4 text-sm text-neutral-800">
          Êtes-vous sûr de vouloir vous déconnecter de l'assistant ? Vous devrez saisir à nouveau vos identifiants pour revenir.
        </p>
      </div>
      
      <form action={logoutAction} className="mt-8 space-y-4">
        <FormButton type="submit" variant="danger">
          Oui, me déconnecter
        </FormButton>
        
        <AuthLink href="/chat" center className="py-3 px-4 rounded-xl">
          Annuler et retourner au chat
        </AuthLink>
      </form>
    </AuthCard>
  )
}
