'use client'

import React, { useState, useEffect, useCallback, createContext } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/chat/Sidebar'
import { api } from '@/services/api'
import { useUserInfo } from '@/hooks/useUserInfo'
import { ChatHeader } from '@/components/chat'

// Contexte pour partager la fonction de rafraîchissement des conversations
export const ConversationsContext = createContext()

/**
 * Layout commun pour toutes les pages du chat
 * Gère la sidebar et son état
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function ChatLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userInfo, loading: isUserLoading } = useUserInfo()
  
  const [conversations, setConversations] = useState([])
  const [isConversationsLoading, setIsConversationsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('Broussaud AI')
  const [activeConversationId, setActiveConversationId] = useState(null)
  
  // État sidebar
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Check mobile
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

  // Fetch conversations pour la sidebar
  const fetchConversations = useCallback(async () => {
    try {
      setIsConversationsLoading(true)
      const response = await api.get('/conversations')
      setConversations(response.data.conversations || response.data || [])
    } catch (err) {
      console.error('Erreur chargement conversations:', err)
    } finally {
      setIsConversationsLoading(false)
    }
  }, [])

  // Recharger conversations quand l'utilisateur change
  useEffect(() => {
    if (userInfo) {
      fetchConversations()
    }
  }, [userInfo, fetchConversations])

  // Handler pour nouvelle conversation
  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null)
    router.replace('/chat')
  }, [router])

  // Handler pour sélectionner une conversation (avec navigation)
  const handleSelectConversation = useCallback((convId) => {
    setActiveConversationId(convId)
    router.push(`/chat?conversation_id=${convId}`)
  }, [router])

  // Fonction pour sélectionner une conversation (sans navigation) - pour usage interne
  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId)
  }, [])

  // Handler pour supprimer une conversation
  const handleDeleteConversation = useCallback(async (convId) => {
    try {
      await api.delete(`/conversations/${convId}`)
      await fetchConversations()
      if (activeConversationId === convId) {
        setActiveConversationId(null)
        router.push('/chat')
      }
    } catch (err) {
      console.error('Erreur suppression conversation:', err)
    }
  }, [activeConversationId, fetchConversations, router])

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }, [isSidebarCollapsed])

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarCollapsed(true)
  }, [])

  const isSidebarLoading = isUserLoading || isConversationsLoading

  return (
    <ConversationsContext.Provider value={{ fetchConversations, selectConversation }}>
      <div className="w-screen h-screen flex overflow-hidden">
        {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNewConversation={handleNewConversation}
        userInfo={userInfo}
        conversations={conversations}
        activeConversationId={activeConversationId}
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
        <ChatHeader />
        {children}
      </main>
    </div>
    </ConversationsContext.Provider>
  )
}
