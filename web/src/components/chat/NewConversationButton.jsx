'use client'

import { Plus } from 'lucide-react'

/**
 * Bouton pour créer une nouvelle conversation
 * 
 * @param {Object} props
 * @param {function} props.onClick - Handler pour le clic
 * @returns {JSX.Element}
 */
export default function NewConversationButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-neutral-900 w-full text-left"
    >
      <Plus className="w-4 h-4" />
      <span className="text-sm">Nouvelle conversation</span>
    </button>
  )
}
