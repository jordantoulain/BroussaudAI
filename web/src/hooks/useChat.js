'use client'

import { useState, useRef, useEffect } from 'react'
import { api } from '@/services/api'
import { parseAPIResponse, createAIMessage, createUserMessage, createErrorMessage, createWelcomeMessage } from '@/utils/messageFormatters'

/**
 * Custom hook pour gérer la logique du chat
 * @returns {Object} États et fonctions pour le chat
 */
export function useChat() {
  // États des messages
  const [messages, setMessages] = useState([createWelcomeMessage()])
  
  // État de l'input
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // État de la conversation
  const [conversationId, setConversationId] = useState(null)
  const [currentPage, setCurrentPage] = useState("Broussaud AI")
  
  // Référence pour le scroll
  const messagesEndRef = useRef(null)
  
  /**
   * Scroll vers le bas de la liste des messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  // Scroll automatique quand les messages changent
  useEffect(() => {
    // Petit délai pour permettre le rendu DOM avant scroll
    const timer = setTimeout(() => {
      scrollToBottom()
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, isLoading])
  
  /**
   * Gère l'envoi d'un message
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userText = input
    const newMessage = createUserMessage(userText)
    
    // Ajout du message utilisateur
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      // Construction du payload
      const payload = { text: userText }
      if (conversationId) {
        payload.conversation_id = conversationId
      }
      
      // Appel API
      const response = await api.post('/ai/chat', payload)
      
      // Sauvegarde de la conversation_id si nouvelle conversation
      if (response.data.conversation_id && !conversationId) {
        setConversationId(response.data.conversation_id)
      }
      
      // Traitement de la réponse
      const rawData = parseAPIResponse(response.data)
      
      // Ajout du message IA
      const aiMessage = createAIMessage(rawData)
      
      setMessages((prev) => [...prev, aiMessage])
      
    } catch (error) {
      console.error("Erreur IA :", error)
      // Message d'erreur
      const errorMessage = createErrorMessage()
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    messages,
    input,
    setInput,
    isLoading,
    conversationId,
    setConversationId,
    currentPage,
    setCurrentPage,
    handleSend,
    messagesEndRef
  }
}
