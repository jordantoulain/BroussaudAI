'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Check, X, Loader2 } from 'lucide-react'

/**
 * Page de configuration du system prompt
 * Permet aux administrateurs de modifier le prompt système de l'agent IA
 *
 * @returns {JSX.Element}
 */
export default function SystemPromptPage() {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [originalPrompt, setOriginalPrompt] = useState('')

  // Récupérer le system prompt au chargement
  useEffect(() => {
    const fetchSystemPrompt = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/admin/config/system-prompt')
        const prompt = response.data.system_prompt || ''
        setSystemPrompt(prompt)
        setOriginalPrompt(prompt)
      } catch (err) {
        console.error('Erreur lors du chargement du system prompt:', err)
        setError('Impossible de charger le system prompt')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSystemPrompt()
  }, [])

  // Sauvegarder le system prompt
  const handleSave = async () => {
    if (saving) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      const response = await api.post('/admin/config/system-prompt', {
        system_prompt: systemPrompt
      })
      
      setSuccess(true)
      setOriginalPrompt(systemPrompt)
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err.response?.data?.detail || 'Impossible de sauvegarder le system prompt')
    } finally {
      setSaving(false)
    }
  }

  // Vérifier si des modifications ont été faites
  const hasChanges = systemPrompt !== originalPrompt

  // Réinitialiser les modifications
  const handleReset = () => {
    setSystemPrompt(originalPrompt)
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Configuration du System Prompt</h1>
          <p className="text-neutral-500 mt-1">
            Modifiez le prompt système utilisé par l'agent IA pour toutes les conversations.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-2xl">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-2xl">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>System prompt sauvegardé avec succès !</span>
        </div>
      )}

      {/* Conteneur principal */}
      <div className="bg-neutral-100 rounded-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Zone de texte pour le system prompt */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full min-h-[400px] p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800 placeholder-neutral-400 resize-vertical"
                placeholder="Entrez le system prompt ici..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  !hasChanges || saving 
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </>
                )}
              </button>

              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Annuler</span>
                </button>
              )}
            </div>

            {/* Info */}
            <div className="text-sm text-neutral-500">
              <p>
                {hasChanges 
                  ? 'Des modifications non sauvegardées sont présentes.'
                  : 'Aucune modification en attente de sauvegarde.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
