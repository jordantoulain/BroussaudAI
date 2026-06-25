'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Check, X, Loader2 } from 'lucide-react'

/**
 * Page de configuration des modèles LLM
 * Permet aux administrateurs de sélectionner le fournisseur et le modèle LLM
 *
 * @returns {JSX.Element}
 */
export default function ModelsPage() {
  const [provider, setProvider] = useState('gemini')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [embedModel, setEmbedModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [originalConfig, setOriginalConfig] = useState(null)

  // Modèles disponibles par fournisseur
  const providerModels = {
    gemini: [
      'gemini-3.1-flash-lite',
      'gemini-3.1-flash',
      'gemini-3.1-pro',
      'gemini-2.5-flash',
      'gemini-2.5-pro'
    ],
    mistral: [
      'mistral-small-latest',
      'mistral-medium-latest',
      'mistral-large-latest',
      'mistral-tiny-latest'
    ],
    ollama: [] // Ollama permet un nom de modèle libre
  }

  // Modèles d'embedding par fournisseur
  const providerEmbedModels = {
    gemini: [
      'gemini-embedding-2',
      'gemini-embedding-1'
    ],
    mistral: [
      'mistral-embed-2312',
      'mistral-embed-2311'
    ],
    ollama: [
      'nomic-embed-text',
      'all-minilm',
      'bge-base-en',
      'bge-small-en'
    ]
  }

  // Récupérer la configuration LLM au chargement
  useEffect(() => {
    const fetchLLMConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/config/llm')
        const config = response.data
        
        setProvider(config.provider || 'gemini')
        setModel(config.model || '')
        setApiKey(config.api_key || '')
        setBaseUrl(config.base_url || '')
        setEmbedModel(config.embed_model || '')
        setOriginalConfig(config)
      } catch (err) {
        console.error('Erreur lors du chargement de la configuration LLM:', err)
        setError('Impossible de charger la configuration LLM')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLLMConfig()
  }, [])

  // Sauvegarder la configuration LLM
  const handleSave = async () => {
    if (saving) return
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      const response = await api.post('/config/llm', {
        provider: provider,
        model: model,
        api_key: apiKey,
        base_url: baseUrl,
        embed_model: embedModel
      })
      
      setSuccess(true)
      setOriginalConfig({
        provider,
        model,
        api_key: apiKey,
        base_url: baseUrl,
        embed_model: embedModel
      })
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError(err.response?.data?.detail || 'Impossible de sauvegarder la configuration LLM')
    } finally {
      setSaving(false)
    }
  }

  // Vérifier si des modifications ont été faites
  const hasChanges = 
    provider !== originalConfig?.provider ||
    model !== originalConfig?.model ||
    apiKey !== originalConfig?.api_key ||
    baseUrl !== originalConfig?.base_url ||
    embedModel !== originalConfig?.embed_model

  // Réinitialiser les modifications
  const handleReset = () => {
    if (originalConfig) {
      setProvider(originalConfig.provider || 'gemini')
      setModel(originalConfig.model || '')
      setApiKey(originalConfig.api_key || '')
      setBaseUrl(originalConfig.base_url || '')
      setEmbedModel(originalConfig.embed_model || '')
    }
    setError(null)
    setSuccess(false)
  }

  // Changer de fournisseur
  const handleProviderChange = (newProvider) => {
    setProvider(newProvider)
    // Réinitialiser le modèle si on change de fournisseur
    if (newProvider === 'ollama') {
      setModel('')
    } else if (providerModels[newProvider] && providerModels[newProvider].length > 0) {
      setModel(providerModels[newProvider][0])
    } else {
      setModel('')
    }
    
    // Réinitialiser l'embedding model
    if (providerEmbedModels[newProvider] && providerEmbedModels[newProvider].length > 0) {
      setEmbedModel(providerEmbedModels[newProvider][0])
    } else {
      setEmbedModel('')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Configuration des Modèles LLM</h1>
          <p className="text-neutral-500 mt-1">
            Sélectionnez le fournisseur et configurez le modèle LLM pour votre application.
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
          <span>Configuration LLM sauvegardée avec succès !</span>
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
            {/* Sélection du fournisseur */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Fournisseur LLM
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => handleProviderChange('gemini')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    provider === 'gemini' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  Google Gemini
                </button>
                <button
                  onClick={() => handleProviderChange('mistral')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    provider === 'mistral' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  Mistral AI
                </button>
                <button
                  onClick={() => handleProviderChange('ollama')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    provider === 'ollama' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                  }`}
                >
                  Ollama
                </button>
              </div>
            </div>

            {/* Sélection du modèle */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Modèle LLM
              </label>
              {provider === 'ollama' ? (
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: qwen3:0.6b, llava:13b, phi3:3.8b"
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800 placeholder-neutral-400"
                />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800"
                >
                  {providerModels[provider]?.map((modelName) => (
                    <option key={modelName} value={modelName}>
                      {modelName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Clé API (masquée pour Ollama qui utilise base_url) */}
            {provider !== 'ollama' && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  Clé API
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'GOOGLE_API_KEY' : 'MISTRAL_API_KEY'}
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800 placeholder-neutral-400"
                />
              </div>
            )}

            {/* Base URL (uniquement pour Ollama) */}
            {provider === 'ollama' && (
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  URL de base (optionnel)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="Ex: http://localhost:11434"
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800 placeholder-neutral-400"
                />
              </div>
            )}

            {/* Modèle d'embedding */}
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                Modèle d'Embedding
              </label>
              {provider === 'ollama' ? (
                <select
                  value={embedModel}
                  onChange={(e) => setEmbedModel(e.target.value)}
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800"
                >
                  {providerEmbedModels[provider]?.map((embedName) => (
                    <option key={embedName} value={embedName}>
                      {embedName}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={embedModel}
                  onChange={(e) => setEmbedModel(e.target.value)}
                  className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none text-neutral-800"
                >
                  {providerEmbedModels[provider]?.map((embedName) => (
                    <option key={embedName} value={embedName}>
                      {embedName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Info provider */}
            <div className="text-sm text-neutral-500 p-4 bg-neutral-50 rounded-lg">
              <p>
                {provider === 'gemini' && (
                  <span>Utilise l'API Google GenAI. Assurez-vous que votre clé API est valide et que vous avez accès au modèle sélectionné.</span>
                )}
                {provider === 'mistral' && (
                  <span>Utilise l'API Mistral AI. Assurez-vous que votre clé API est valide et que vous avez accès au modèle sélectionné.</span>
                )}
                {provider === 'ollama' && (
                  <span>Utilise Ollama en local. Entrez le nom du modèle à utiliser (ex: qwen3:0.6b) et éventuellement l'URL de votre instance Ollama.</span>
                )}
              </p>
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
                  : 'Aucune modification en attente de sauvegarde.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
