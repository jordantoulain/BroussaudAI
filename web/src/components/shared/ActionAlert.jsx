'use client'

import { TriangleAlert, CheckCircle2 } from 'lucide-react'

/**
 * Composant d'alerte d'erreur
 * 
 * @param {Object} props
 * @param {string} props.message - Message d'erreur à afficher
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function ActionError({ message, className = '' }) {
  if (!message) return null
  
  return (
    <div className={`mb-4 p-4 bg-red-500 text-white rounded-xl flex items-center gap-3 ${className}`}>
      <TriangleAlert className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * Composant d'alerte de succès
 * 
 * @param {Object} props
 * @param {string} props.message - Message de succès à afficher
 * @param {string} [props.className] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function ActionSuccess({ message, className = '' }) {
  if (!message) return null
  
  return (
    <div className={`mb-4 p-4 bg-green-500 text-white rounded-xl flex items-center gap-3 ${className}`}>
      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
