'use client'

import { useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

/**
 * Composant Modal de confirmation generique
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si vrai, la modale est ouverte
 * @param {Function} props.onClose - Callback pour fermer la modale
 * @param {Function} props.onConfirm - Callback pour confirmer l'action
 * @param {string} [props.title='Confirmer'] - Titre de la modale
 * @param {string} [props.message=''] - Message de confirmation
 * @param {string} [props.confirmText='Confirmer'] - Texte du bouton de confirmation
 * @param {string} [props.cancelText='Annuler'] - Texte du bouton d'annulation
 * @param {'danger'|'warning'|'info'} [props.variant='danger'] - Variante de couleur
 * @returns {JSX.Element}
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmer",
  message = "",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger"
}) {
  // Gerer le scroll du body
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
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Couleurs selon la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconClass: 'text-red-500',
          containerClass: 'bg-red-100',
          confirmClass: 'bg-red-500 hover:bg-red-400'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          iconClass: 'text-amber-500',
          containerClass: 'bg-amber-100',
          confirmClass: 'bg-amber-500 hover:bg-amber-400'
        }
      case 'info':
        return {
          icon: AlertTriangle,
          iconClass: 'text-blue-500',
          containerClass: 'bg-blue-100',
          confirmClass: 'bg-blue-500 hover:bg-blue-400'
        }
      default:
        return {
          icon: AlertTriangle,
          iconClass: 'text-red-500',
          containerClass: 'bg-red-100',
          confirmClass: 'bg-red-500 hover:bg-red-400'
        }
    }
  }

  const { icon: Icon, iconClass, containerClass, confirmClass } = getVariantStyles()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
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
            <div className={`w-16 h-16 ${containerClass} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`w-8 h-8 ${iconClass}`} />
            </div>
            
            <h2 id="confirm-modal-title" className="text-xl font-bold text-neutral-800 mb-2">
              {title}
            </h2>
            
            {message && (
              <p className="text-neutral-600 mb-6">
                {message}
              </p>
            )}
            
            {/* Boutons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={onClose}
                className="cursor-pointer px-6 py-2.5 bg-neutral-100 rounded-xl text-neutral-700 hover:bg-neutral-200 transition-colors font-medium"
              >
                {cancelText}
              </button>
              
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`px-6 cursor-pointer py-2.5 ${confirmClass} text-white rounded-xl transition-colors font-medium`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
