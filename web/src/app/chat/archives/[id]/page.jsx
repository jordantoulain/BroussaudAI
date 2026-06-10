'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/services/api'
import ChatHeader from '@/components/chat/ChatHeader'
import MessageList from '@/components/chat/MessageList'
import { TextSkeleton } from '@/components/shared'
import { formatHistoricalMessages } from '@/utils/messageFormatters'

/**
 * Composant interne qui utilise useParams (nécessite Suspense boundary)
 */
function ArchiveConversationContent() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversation, setConversation] = useState(null)
  const messagesEndRef = { current: null }

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/conversations/archives/${params.id}`)
      const data = response.data
      setConversation(data.conversation)
      
      // Formater les messages
      const interleaved = formatHistoricalMessages(data.messages)
      
      setMessages(interleaved)
    } catch (err) {
      console.error('Erreur chargement conversation archivée:', err)
      setError('Impossible de charger la conversation')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchConversation()
    }
  }, [params.id, fetchConversation])

  // Scroll automatique
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, loading])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader title={conversation?.title || 'Chargement...'} />
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <TextSkeleton widthClass="w-3/4" className="h-4" />
                  <TextSkeleton widthClass="w-1/2" className="h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col bg-red-500 text-white px-4 py-3 rounded-2xl relative" role="alert">
          <div className="flex gap-2 items-center">
            <strong className="font-bold">Erreur !</strong>
          </div>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <ChatHeader title={conversation?.title || 'Conversation archivée'} isArchived />
      
      {/* Messages list - Lecture seule */}
      <MessageList 
        messages={messages} 
        isLoading={loading} 
        messagesEndRef={messagesEndRef}
        isAdminView
      />
      
      {/* Message de lecture seule */}
      <div className="p-4 text-center text-sm text-neutral-500">
        Conversation archivée
      </div>
    </div>
  )
}

/**
 * Page d'affichage d'une conversation archivée (lecture seule)
 * 
 * @returns {JSX.Element}
 */
export default function ArchiveConversationPage() {
  return (
    <Suspense fallback={null}>
      <ArchiveConversationContent />
    </Suspense>
  )
}
