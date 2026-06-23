'use client'

import { useState, useEffect, useCallback, useRef, Suspense, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { api } from '@/services/api'
import { ConversationsContext } from './layout'
import { parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, formatHistoricalMessages } from '@/utils/messageFormatters'
import { ChevronsDown } from 'lucide-react'

/**
 * Composant interne qui utilise useSearchParams (nécessite Suspense boundary)
 */
function ChatPageContent({ 
  chatMessages, 
  input, 
  setInput, 
  isChatLoading, 
  conversationId,
  setConversationId,
  messagesEndRef,
  scrollToBottom
}) {
  const { fetchConversations, selectConversation } = useContext(ConversationsContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation_id')
  
  // Référence pour le conteneur des messages
  const messagesContainerRef = useRef(null)
  
  // État pour afficher/masquer le bouton de défilement
  const [showScrollButton, setShowScrollButton] = useState(false)
  
  // Messages combinés (historiques + nouveaux)
  const [messages, setMessages] = useState(chatMessages)
  const [isLoading, setIsLoading] = useState(false)
  
  // Synchroniser conversationId depuis l'URL (l'URL est la source de vérité)
  useEffect(() => {
    setConversationId(conversationIdParam || null)
  }, [conversationIdParam, setConversationId])

  // Charger la conversation quand conversationId change
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        setIsLoading(true)
        try {
          const response = await api.get(`/conversations/${conversationId}`)
          const data = response.data
          // Formater les messages historiques
          const interleaved = formatHistoricalMessages(data.messages)
          
          // Ajouter le message de bienvenue en premier (uniquement pour les conversations actives)
          const hasWelcomeMessage = interleaved.some(msg => msg.id === 'welcome-message')
          const messagesWithWelcome = hasWelcomeMessage 
            ? interleaved 
            : [createWelcomeMessage(), ...interleaved]
          
          setMessages(messagesWithWelcome)
        } catch (err) {
          console.error('Erreur chargement conversation:', err)
        } finally {
          setIsLoading(false)
        }
      } else {
        // Nouvelle conversation
        setMessages([createWelcomeMessage()])
      }
    }
    
    loadConversation()
  }, [conversationId])

  // Synchroniser les messages du chat
  useEffect(() => {
    if (!conversationId) {
      setMessages(chatMessages)
    }
  }, [chatMessages, conversationId])

  // Scroll automatique quand les messages changent
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, isLoading, messagesEndRef])

  // Handler pour la détection de scroll
  const handleScroll = useCallback((container) => {
    if (!container) return
    // Afficher le bouton si on n'est pas en bas du conteneur
    // On vérifie si scrollTop + clientHeight < scrollHeight - 10 (petite marge)
    const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10
    setShowScrollButton(!isAtBottom)
  }, [])

  // Masquer le bouton quand de nouveaux messages arrivent
  useEffect(() => {
    setShowScrollButton(false)
  }, [messages])

  // Handler pour nouvelle conversation
  const handleNewConversation = useCallback(() => {
    setConversationId(null)
    setMessages([createWelcomeMessage()])
    setInput("")
  }, [setConversationId, setMessages, setInput])

  // Handler pour l'envoi de message
  const handleSend = useCallback(async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userText = input
    const newMessage = createUserMessage(userText)
    
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      const payload = { text: userText }
      if (conversationId) {
        payload.conversation_id = conversationId
      }
      
      const response = await api.post('/ai/chat', payload)
      
      if (response.data.conversation_id && !conversationId) {
        setConversationId(response.data.conversation_id)
        // Refléter la conversation dans l'URL (source de vérité)
        router.replace(`/chat?conversation_id=${response.data.conversation_id}`)
        // Sélectionner la nouvelle conversation dans la sidebar
        selectConversation?.(response.data.conversation_id)
        // Rafraîchir la liste des conversations dans la sidebar
        fetchConversations?.()
      }
      
      const rawData = parseAPIResponse(response.data)
      
      // Utiliser le message_id retourné par le backend si disponible, sinon générer un ID local
      const backendMessageId = response.data.message_id
      const aiMessage = createAIMessage(rawData)
      
      // Si on a un ID de backend, l'utiliser
      if (backendMessageId) {
        aiMessage.id = backendMessageId
      }
      
      setMessages((prev) => [...prev, aiMessage])
      
    } catch (error) {
      console.error("Erreur IA :", error)
      const errorMessage = createErrorMessage()
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, conversationId, setInput, setConversationId, selectConversation, fetchConversations, router])

  return (
    <>
      {/* Messages list */}
      <MessageList 
        messages={messages} 
        isLoading={isLoading || isChatLoading} 
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        onScroll={handleScroll}
      />
      
      {/* Bouton pour redescendre en bas */}
      {showScrollButton && scrollToBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-10 right-4 md:right-10 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-110 z-50"
          aria-label="Descendre en bas"
        >
          <ChevronsDown className="w-5 h-5" />
        </button>
      )}
      
      {/* Input */}
      <div className="p-4">
        <ChatInput
          input={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSend}
          isLoading={isLoading || isChatLoading}
        />
      </div>
    </>
  )
}

/**
 * Page principale du chat
 * 
 * @returns {JSX.Element}
 */
export default function ChatPage() {
  const { 
    messages: chatMessages, 
    input, 
    setInput, 
    isLoading: isChatLoading, 
    conversationId,
    setConversationId,
    messagesEndRef,
    scrollToBottom
  } = useChat()

  return (
    <Suspense fallback={null}>
      <ChatPageContent
        chatMessages={chatMessages}
        input={input}
        setInput={setInput}
        isChatLoading={isChatLoading}
        conversationId={conversationId}
        setConversationId={setConversationId}
        messagesEndRef={messagesEndRef}
        scrollToBottom={scrollToBottom}
      />
    </Suspense>
  )
}
