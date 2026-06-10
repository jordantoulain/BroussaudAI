'use client'

import Link from 'next/link'

/**
 * Composant de lien pour les pages d'authentification
 * 
 * @param {Object} props
 * @param {string} props.href - URL du lien
 * @param {React.ReactNode} props.children - Contenu du lien
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {boolean} [props.center=false] - Si vrai, centre le contenu
 * @returns {JSX.Element}
 */
export default function AuthLink({ href, children, className = '', center = false }) {
  const baseStyles = 'text-sm font-bold text-black hover:text-neutral-800 transition-colors'
  const centerStyles = center ? 'w-full flex justify-center' : ''
  
  return (
    <Link 
      href={href}
      className={`${baseStyles} ${centerStyles} ${className}`}
    >
      {children}
    </Link>
  )
}
