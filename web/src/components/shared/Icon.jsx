'use client'

import * as LucideIcons from 'lucide-react'

/**
 * Composant Icon pour afficher des icônes Lucide avec couleur
 * Utilisé dans les réponses formatées avec %ICON_XXX%
 * 
 * @param {object} props
 * @param {string} props.name - Nom de l'icône (ex: 'Check', 'X', 'Loader2')
 * @param {string} props.color - Couleur Tailwind (ex: 'text-green-500')
 * @param {string} props.size - Taille (default: '4')
 * @param {string} props.className - Classes additionnelles
 */
export function Icon({ name, color = 'text-current', size = '4', className = '' }) {
  const LucideIcon = LucideIcons[name]

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`)
    return null
  }

  return (
    <LucideIcon 
      size={parseInt(size)} 
      className={`${color} ${className}`.trim()}
    />
  )
}
