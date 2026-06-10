'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

/**
 * Composant SideCanvas - panneau latéral glissant depuis la droite
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si vrai, le canvas est ouvert
 * @param {Function} props.onClose - Callback pour fermer le canvas
 * @param {string} props.title - Titre du canvas
 * @param {JSX.Element} props.children - Contenu du canvas
 * @returns {JSX.Element}
 */
export default function SideCanvas({ isOpen, onClose, title, children }) {
  // Gérer le scroll du body quand le canvas est ouvert
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

  // Fermer au clic extérieur
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

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

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/10 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Canvas */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-canvas-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 id="side-canvas-title" className="text-xl font-bold text-neutral-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors text-neutral-600 hover:text-neutral-800"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenu */}
        <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  )
}
