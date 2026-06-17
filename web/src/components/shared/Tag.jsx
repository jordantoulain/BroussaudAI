'use client'

import { Check, X, Hourglass, Circle } from 'lucide-react'

/**
 * Composant Tag pour afficher des badges avec icône et couleur
 * Utilisé dans les réponses formatées avec %TAG_XXX%
 */
export function Tag({ type, label }) {
  const tagConfig = {
    TERMINE: {
      icon: Check,
      color: 'bg-green-500',
      defaultLabel: 'Validé'
    },
    EN_COURS: {
      icon: Hourglass,
      color: 'bg-blue-500',
      defaultLabel: 'En cours'
    },
    ERREUR: {
      icon: X,
      color: 'bg-red-500',
      defaultLabel: 'Erreur'
    },
    A_FAIRE: {
      icon: Circle,
      color: 'bg-gray-500',
      defaultLabel: 'À faire'
    },
    VALIDE: {
      icon: Check,
      color: 'bg-green-500',
      defaultLabel: 'Validé'
    },
    ECHEC: {
      icon: X,
      color: 'bg-red-500',
      defaultLabel: 'Échec'
    },
    ATTENTE: {
      icon: Hourglass,
      color: 'bg-amber-500',
      defaultLabel: 'En attente'
    },
    URGENT: {
      icon: X,
      color: 'bg-red-500',
      defaultLabel: 'Urgent'
    }
  }

  const config = tagConfig[type.toUpperCase()] || tagConfig.A_FAIRE
  const Icon = config.icon
  const displayLabel = label || config.defaultLabel

  return (
    <span className={`inline-flex text-white items-center px-2 py-1 rounded-md text-xs font-medium mr-2 ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {displayLabel}
    </span>
  )
}
