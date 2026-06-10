'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/chat/Sidebar'
import ChatHeader from '@/components/chat/ChatHeader'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { useChat } from '@/hooks/useChat'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useConversations } from '@/hooks/useConversations'
import { api } from '@/services/api'

/**
 * Page principale du chat
 * 
 * @returns {JSX.Element}
 */
export default function ChatPage() {
  // Hooks personnalisés
  const { 
    messages: chatMessages, 
    input, 
    setInput, 
    isLoading: isChatLoading, 
    conversationId,
    setConversationId,
    currentPage,
    messagesEndRef 
  } = useChat()
  
  const { userInfo, loading: isUserLoading } = useUserInfo()
  const { 
    conversations, 
    isLoading: isConversationsLoading,
    fetchConversations,
    fetchConversation,
    deleteConversation 
  } = useConversations()
  
  // Messages combinés (historiques + nouveaux)
  const [messages, setMessages] = useState(chatMessages)
  const [isLoading, setIsLoading] = useState(false)
  
  // État de chargement pour la sidebar (profil + historique)
  const isSidebarLoading = isUserLoading || isConversationsLoading
  
  // État sidebar
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsSidebarCollapsed(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Synchroniser les messages du chat
  useEffect(() => {
    setMessages(chatMessages)
  }, [chatMessages])

  // Scroll automatique quand les messages changent (pour les conversations chargées)
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, isLoading, messagesEndRef])

  // Handler pour la sélection d'une conversation
  const handleSelectConversation = useCallback(async (convId) => {
    setIsLoading(true)
    try {
      const data = await fetchConversation(convId)
      setConversationId(convId)
      
      // Formater les messages historiques
      const formattedMessages = data.messages.map((msg, index) => ({
        id: msg.id || index,
        data: {
          label: msg.label || 'SYSTÈME',
          sub_label: msg.sub_label || 'HISTORIQUE',
          tags: msg.tags || [],
          contexts: msg.contexts || [],
          answer: msg.response
        },
        isClient: false
      }))
      
      // Ajouter les messages utilisateurs
      const userMessages = data.messages.map((msg, index) => ({
        id: `user-${msg.id || index}`,
        text: msg.question,
        isClient: true
      }))
      
      // Intercaler utilisateur + IA
      const interleaved = []
      for (let i = 0; i < formattedMessages.length; i++) {
        if (userMessages[i]) interleaved.push(userMessages[i])
        interleaved.push(formattedMessages[i])
      }
      
      setMessages(interleaved)
    } catch (err) {
      console.error('Erreur chargement conversation:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchConversation, setConversationId])

  // Handler pour nouvelle conversation
  const handleNewConversation = () => {
    setConversationId(null)
    setMessages([
      {
        id: 1,
        data: {
          label: "SYSTÈME",
          sub_label: "ACCUEIL",
          tags: ["introduction", "assistant"],
          answer: "Bonjour ! Je suis l'assistant de l'usine Broussaud. Comment puis-je t'aider aujourd'hui ?"
        },
        isClient: false
      }
    ])
    setInput("")
  }

  // Handler pour la suppression d'une conversation
  const handleDeleteConversation = useCallback(async (convId) => {
    try {
      await deleteConversation(convId)
      await fetchConversations()
      if (conversationId === convId) {
        handleNewConversation()
      }
    } catch (err) {
      console.error('Erreur suppression conversation:', err)
    }
  }, [deleteConversation, fetchConversations, conversationId, handleNewConversation])

  // Handler pour l'envoi de message (adapté pour gérer conversationId)
  const handleSend = useCallback(async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userText = input
    const newMessage = { 
      id: Date.now(), 
      text: userText, 
      isClient: true 
    }
    
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
        await fetchConversations()
      }
      
      let rawData = response.data.response || response.data
      
      if (typeof rawData === 'string') {
        try {
          const cleanString = rawData.replace(/```json/gi, '').replace(/```/g, '').trim()
          rawData = JSON.parse(cleanString)
        } catch (e) {
          rawData = { answer: rawData }
        }
      }
      
      const aiMessage = { 
        id: Date.now() + 1, 
        data: rawData, 
        isClient: false 
      }
      
      setMessages((prev) => [...prev, aiMessage])
      
    } catch (error) {
      console.error("Erreur IA :", error)
      const errorMessage = { 
        id: Date.now() + 1, 
        data: {
          label: "ERREUR",
          sub_label: "SYSTÈME",
          tags: ["erreur", "réseau"],
          answer: "Désolé, je n'ai pas pu joindre le serveur. Veuillez réessayer."
        }, 
        isClient: false 
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, conversationId, setInput, setConversationId, fetchConversations])

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }
  
  const handleCloseSidebar = () => {
    setIsSidebarCollapsed(true)
  }
  
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNewConversation={handleNewConversation}
        userInfo={userInfo}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isMobile={isMobile}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        onClose={handleCloseSidebar}
        isLoading={isSidebarLoading}
      />
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden px-4 md:px-20 pl-12">
        {/* Header */}
        <ChatHeader />
        
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
      </main>
    </div>
  )
}
