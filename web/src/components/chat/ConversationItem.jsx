'use client'

import { Trash2, Pin, Pencil, X } from 'lucide-react'
import { useState } from 'react'

/**
 * Composant atomique pour afficher un élément de conversation dans la liste
 * * @param {Object} props
 * @param {Object} props.conversation - Objet conversation
 * @param {string} props.conversation.id - ID de la conversation
 * @param {string} props.conversation.title - Titre de la conversation
 * @param {boolean} props.conversation.pinned - Si vrai, la conversation est épinglée
 * @param {boolean} props.isActive - Si vrai, la conversation est active
 * @param {function} props.onClick - Handler pour le clic
 * @param {function} props.onDelete - Handler pour la suppression
 * @param {function} props.onTogglePin - Handler pour épingler/désépingler
 * @param {function} props.onRename - Handler pour renommer la conversation
 * @returns {JSX.Element}
 */
export default function ConversationItem({ conversation, isActive = false, onClick, onDelete, onTogglePin, onRename }) {
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [renameError, setRenameError] = useState('')
  const [renameLoading, setRenameLoading] = useState(false)

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

  const handleOpenRenameModal = (e) => {
    e.stopPropagation()
    setNewTitle(conversation.title || '')
    setRenameError('')
    setShowRenameModal(true)
  }

  const handleCloseRenameModal = () => {
    setShowRenameModal(false)
    setRenameError('')
  }

  const handleRename = async () => {
    if (!newTitle.trim()) {
      setRenameError('Le titre ne peut pas être vide')
      return
    }

    setRenameLoading(true)
    try {
      if (onRename) {
        await onRename(conversation.id, newTitle.trim())
      }
      handleCloseRenameModal()
    } catch (error) {
      setRenameError(error.message || 'Erreur lors du renommage')
    } finally {
      setRenameLoading(false)
    }
  }

  return (
    <div className="relative flex items-center group w-full">
      <button
        onClick={onClick}
        className={`cursor-pointer w-full text-left pl-3 py-2 pr-3 group-hover:pr-22 rounded-lg transition-all text-sm text-neutral-600 truncate ${
          isActive ? 'bg-neutral-200' : 'group-hover:bg-neutral-200'
        }`}
      >
        {conversation.title || `Conversation ${conversation.id?.slice(0, 8)}`}
      </button>
      
      <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onRename && (
          <button
            onClick={handleOpenRenameModal}
            className="cursor-pointer p-1 rounded-lg transition-colors hover:bg-neutral-200"
            aria-label="Renommer la conversation"
          >
            <Pencil className="w-4 h-4 text-neutral-400 hover:text-neutral-600 transition-colors" />
          </button>
        )}
        {onTogglePin && (
          <button
            onClick={handleTogglePin}
            className="cursor-pointer p-1 rounded-lg transition-colors hover:bg-neutral-200"
            aria-label={conversation.pinned ? "Désépingler la conversation" : "Épingler la conversation"}
          >
            <Pin className={`w-4 h-4 ${conversation.pinned ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'} transition-colors`} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="cursor-pointer p-1 rounded-lg transition-colors hover:bg-neutral-200"
          aria-label="Supprimer la conversation"
        >
          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">
                Renommer la conversation
              </h2>
              <button
                onClick={handleCloseRenameModal}
                className="cursor-pointer p-1 rounded-lg hover:bg-neutral-200 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nouveau titre*
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Entrez le nouveau titre..."
                className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800 placeholder-neutral-400"
                disabled={renameLoading}
              />
            </div>

            {renameError && (
              <div className="flex flex-col bg-red-500 text-white px-4 py-3 rounded-lg mb-4" role="alert">
                <div className="flex gap-2 items-center">
                  <strong className="font-bold">Erreur !</strong>
                </div>
                <span className="block sm:inline"> {renameError}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseRenameModal}
                disabled={renameLoading}
                className="px-4 py-2 cursor-pointer bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleRename}
                disabled={renameLoading || !newTitle.trim()}
                className="px-4 py-2 cursor-pointer rounded-lg text-white font-medium disabled:opacity-50 bg-orange-500 hover:bg-orange-600"
              >
                {renameLoading ? 'En cours...' : 'Renommer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}