'use client'

import { Trash2, Pin } from 'lucide-react'

/**
 * Composant atomique pour afficher un élément de conversation dans la liste
 * 
 * @param {Object} props
 * @param {Object} props.conversation - Objet conversation
 * @param {string} props.conversation.id - ID de la conversation
 * @param {string} props.conversation.title - Titre de la conversation
 * @param {boolean} props.conversation.pinned - Si vrai, la conversation est épinglée
 * @param {boolean} props.isActive - Si vrai, la conversation est active
 * @param {function} props.onClick - Handler pour le clic
 * @param {function} props.onDelete - Handler pour la suppression
 * @param {function} props.onTogglePin - Handler pour épingler/désépingler
 * @returns {JSX.Element}
 */
export default function ConversationItem({ conversation, isActive = false, onClick, onDelete, onTogglePin }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(conversation.id)
    }
  }

  const handleTogglePin = (e) => {
    e.stopPropagation()
    if (onTogglePin) {
      onTogglePin(conversation.id, !conversation.pinned)
    }
  }

  return (
    <div className="flex items-center group w-full">
      <button
        onClick={onClick}
        className={`cursor-pointer flex-1 text-left px-3 py-2 rounded-lg transition-colors text-sm text-neutral-600 truncate ${
          isActive ? 'bg-neutral-200' : 'group-hover:bg-neutral-200'
        }`}
      >
        {conversation.title || `Conversation ${conversation.id?.slice(0, 8)}`}
      </button>
      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onTogglePin && (
          <button
            onClick={handleTogglePin}
            className="cursor-pointer p-1 rounded-lg transition-colors"
            aria-label={conversation.pinned ? "Désépingler la conversation" : "Épingler la conversation"}
          >
            <Pin className={`w-4 h-4 ${conversation.pinned ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'} transition-colors`} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="cursor-pointer p-1 rounded-lg transition-colors"
          aria-label="Supprimer la conversation"
        >
          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  )
}
