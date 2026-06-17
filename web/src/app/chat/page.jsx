'use client'

import { useState, useEffect, useCallback, Suspense, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { api } from '@/services/api'
import { ConversationsContext } from './layout'
import { parseAPIResponse, createAIMessage, createUserMessage, createWelcomeMessage, formatHistoricalMessages } from '@/utils/messageFormatters'

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
  messagesEndRef
}) {
  const { fetchConversations, selectConversation } = useContext(ConversationsContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationIdParam = searchParams.get('conversation_id')
  
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
          console.log(interleaved)
          
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
      
      const aiMessage = createAIMessage(rawData)
      
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
      />
      
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
    messagesEndRef 
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
      />
    </Suspense>
  )
}
