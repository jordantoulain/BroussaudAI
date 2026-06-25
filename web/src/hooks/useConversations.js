'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'

/**
 * Custom hook pour gérer les conversations
 * @returns {Object} États et fonctions pour les conversations
 */
export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Charge la liste des conversations de l'utilisateur
   */
  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/conversations')
      setConversations(response.data || [])
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des conversations')
      console.error('Erreur fetch conversations:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Charge une conversation spécifique
   * @param {string} conversationId - ID de la conversation à charger
   * @returns {Promise<Object>} La conversation et ses messages
   */
  const fetchConversation = useCallback(async (conversationId) => {
    try {
      const response = await api.get(`/conversations/${conversationId}`)
      return response.data
    } catch (err) {
      console.error('Erreur fetch conversation:', err)
      throw err
    }
  }, [])

  /**
   * Supprime une conversation (soft delete)
   * @param {string} conversationId - ID de la conversation à supprimer
   * @returns {Promise<boolean>} True si succès
   */
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`)
      return true
    } catch (err) {
      console.error('Erreur delete conversation:', err)
      throw err
    }
  }, [])

  /**
   * Met à jour une conversation (ex: renommer le titre)
   * @param {string} conversationId - ID de la conversation à mettre à jour
   * @param {Object} updates - Données de mise à jour
   * @param {string} updates.title - Nouveau titre
   * @returns {Promise<Object>} La conversation mise à jour
   */
  const updateConversation = useCallback(async (conversationId, updates) => {
    try {
      const response = await api.patch(`/conversations/${conversationId}`, updates)
      return response.data
    } catch (err) {
      console.error('Erreur update conversation:', err)
      throw err
    }
  }, [])

  // Charger les conversations au montage
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    fetchConversation,
    deleteConversation,
    updateConversation
  }
}
