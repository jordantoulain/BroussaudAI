'use client'

import { useState, useCallback } from 'react'
import { ThumbsUp, ThumbsDown, X } from 'lucide-react'
import { api } from '@/services/api'

/**
 * Composant modale pour soumettre un avis sur une réponse
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si vrai, la modale est ouverte
 * @param {function} props.onClose - Callback pour fermer la modale
 * @param {number} props.messageId - ID du message à évaluer
 * @param {function} props.onSubmit - Callback après soumission réussie
 * @returns {JSX.Element}
 */
export default function ReviewModal({ isOpen, onClose, messageId, onSubmit }) {
  const [rating, setRating] = useState(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleRatingSelect = useCallback((value) => {
    setRating(value)
    setError(null)
  }, [])

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (rating === null) {
      setError('Veuillez sélectionner un avis (positif ou négatif)')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await api.post('/reviews', {
        message_id: messageId,
        rating: rating,
        description: description || null
      })
      
      // Réinitialiser et fermer
      setRating(null)
      setDescription('')
      onSubmit?.()
      onClose()
    } catch (err) {
      console.error('Erreur soumission avis:', err)
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi de l\'avis')
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, description, messageId, onSubmit, onClose])

  const handleClose = useCallback(() => {
    setRating(null)
    setDescription('')
    setError(null)
    onClose()
  }, [onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-100 rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Donner votre avis</h2>
          <button
            onClick={handleClose}
            className="cursor-pointer p-1 rounded-lg hover:bg-neutral-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Sélection du rating */}
        <div className="mb-6">
          <p className="text-sm text-neutral-600 mb-3">Comment évaluez-vous cette réponse ?</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleRatingSelect(true)}
              className={`flex-1 flex items-center cursor-pointer justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all ${
                rating === true 
                  ? 'bg-green-100 border-green-500' 
                  : 'bg-neutral-200 hover:bg-neutral-300 border-transparent'
              }`}
              aria-label="Avis positif"
            >
              <ThumbsUp className={`w-5 h-5 ${rating === true ? 'text-green-600' : 'text-neutral-500'}`} />
              <span className={`font-medium ${rating === true ? 'text-green-700' : 'text-neutral-600'}`}>
                Positif
              </span>
            </button>
            <button
              onClick={() => handleRatingSelect(false)}
              className={`flex-1 flex items-center cursor-pointer justify-center gap-2 py-3 px-4 border-2 rounded-xl transition-all ${
                rating === false 
                  ? 'bg-red-100 border-red-500' 
                  : 'bg-neutral-200 hover:bg-neutral-300 border-transparent'
              }`}
              aria-label="Avis négatif"
            >
              <ThumbsDown className={`w-5 h-5 ${rating === false ? 'text-red-600' : 'text-neutral-500'}`} />
              <span className={`font-medium ${rating === false ? 'text-red-700' : 'text-neutral-600'}`}>
                Négatif
              </span>
            </button>
          </div>
        </div>

        {/* Champ description */}
        <div className="mb-6">
          <label className="block text-sm text-neutral-600 mb-2">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Décrivez ce que vous avez aimé ou ce qui pourrait être amélioré..."
            className="w-full px-4 py-3 rounded-xl bg-neutral-200 text-neutral-800 placeholder-neutral-500 border-none outline-none resize-none h-24"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl cursor-pointer bg-neutral-300 text-neutral-700 hover:bg-neutral-400 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === null}
            className="px-4 py-2 rounded-xl cursor-pointer bg-violet-500 text-white hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
          </button>
        </div>
      </div>
    </div>
  )
}
