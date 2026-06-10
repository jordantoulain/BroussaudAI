'use client'

import { TriangleAlert } from 'lucide-react'

/**
 * Composant pour afficher une alerte d'erreur
 * 
 * @param {Object} props
 * @param {string} props.error - Message d'erreur à afficher
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function ErrorAlert({ error, className = '' }) {
  if (!error) return null
  
  return (
    <div className={`flex bg-red-500 p-4 rounded-2xl items-center justify-center text-white font-medium ${className}`}>
      <TriangleAlert className='w-5 h-5 mr-2' />
      <p className="text-sm">{error}</p>
    </div>
  )
}
