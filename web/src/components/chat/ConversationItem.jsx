'use client'

import { Trash2 } from 'lucide-react'

/**
 * Composant atomique pour afficher un élément de conversation dans la liste
 * 
 * @param {Object} props
 * @param {Object} props.conversation - Objet conversation
 * @param {string} props.conversation.id - ID de la conversation
 * @param {string} props.conversation.title - Titre de la conversation
 * @param {boolean} props.isActive - Si vrai, la conversation est active
 * @param {function} props.onClick - Handler pour le clic
 * @param {function} props.onDelete - Handler pour la suppression
 * @returns {JSX.Element}
 */
export default function ConversationItem({ conversation, isActive = false, onClick, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(conversation.id)
    }
  }

  return (
    <div className="flex items-center group gap-2">
      <button
        onClick={onClick}
        className={`cursor-pointer flex-1 text-left px-3 py-2 rounded-lg transition-colors text-sm text-neutral-600 truncate ${
          isActive ? 'bg-neutral-200' : 'group-hover:bg-neutral-200'
        }`}
      >
        {conversation.title || `Conversation ${conversation.id?.slice(0, 8)}`}
      </button>
      <button
        onClick={handleDelete}
        className="cursor-pointer opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity"
        aria-label="Supprimer la conversation"
      >
        <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />
      </button>
    </div>
  )
}
