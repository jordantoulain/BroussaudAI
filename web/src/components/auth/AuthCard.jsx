'use client'

/**
 * Composant container pour les pages d'authentification
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu de la carte
 * @param {string} [props.className=''] - Classes CSS supplémentaires pour le container
 * @param {string} [props.cardClassName=''] - Classes CSS supplémentaires pour la carte
 * @returns {JSX.Element}
 */
export default function AuthCard({ children, className = '', cardClassName = '' }) {
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className={`max-w-md w-full space-y-8 p-8 rounded-2xl bg-neutral-100 ${cardClassName}`}>
        {children}
      </div>
    </div>
  )
}
