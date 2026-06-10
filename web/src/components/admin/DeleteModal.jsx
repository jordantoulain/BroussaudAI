'use client'

import { useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'

/**
 * Composant Modal de confirmation de suppression
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si vrai, la modale est ouverte
 * @param {Function} props.onClose - Callback pour fermer la modale
 * @param {Function} props.onConfirm - Callback pour confirmer la suppression
 * @param {string} props.title - Titre de la modale
 * @param {string} props.message - Message de confirmation
 * @param {string} [props.itemName] - Nom de l'item à supprimer (optionnel)
 * @returns {JSX.Element}
 */
export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ?",
  itemName
}) {
  // Gérer le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="bg-white rounded-2xl w-full max-w-md p-8 relative">
          {/* Bouton de fermeture */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500 hover:text-neutral-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Contenu */}
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 id="delete-modal-title" className="text-xl font-bold text-neutral-800 mb-2">
              {title}
            </h2>
            
            <p className="text-neutral-600 mb-6">
              {itemName ? `${message} "${itemName}"?` : message}
            </p>
            
            {/* Boutons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onClose}
                className="cursor-pointer px-6 py-2.5 bg-neutral-100 rounded-xl text-neutral-700 hover:bg-neutral-200 transition-colors font-medium"
              >
                Annuler
              </button>
              
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-6 cursor-pointer py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-400 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
