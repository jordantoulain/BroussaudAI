'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/services/api'
import MessageList from '@/components/chat/MessageList'
import LoadingIndicator from '@/components/chat/LoadingIndicator'
import { ChevronLeft } from 'lucide-react'

/**
 * Page de détail d'une conversation (admin)
 * Affiche tous les messages avec MessageList, MessageMeta, Message
 * 
 * @returns {JSX.Element}
 */
export default function AdminConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!params.id) {
          throw new Error('ID de conversation manquant')
        }
        
        const response = await api.get(`/admin/conversations/${params.id}`)
        
        setConversation(response.data.conversation)
        
        // Formater les messages pour MessageList
        const formattedMessages = response.data.messages.flatMap((msg, index) => {
          const messages = []
          
          if (msg.question !== undefined) {
            messages.push({
              id: `${msg.id || index}-question`,
              text: msg.question,
              isClient: true
            })
          }
          
          if (msg.response !== undefined) {
            messages.push({
              id: `${msg.id || index}-response`,
              data: {
                label: msg.label || 'RAG',
                sub_label: msg.sub_label || 'GENERAL',
                tags: msg.tags || [],
                contexts: msg.contexts || [],
                file: msg.file || [],
                answer: msg.response
              },
              isClient: false
            })
          }
          
          return messages
        })

        setMessages(formattedMessages)
      } catch (err) {
        console.error('Erreur chargement conversation:', err)
        setError(err.response?.data?.detail || 'Impossible de charger la conversation')
      } finally {
        setLoading(false)
      }
    }
    
    fetchConversation()
  }, [params.id])

  // Scroll vers le bas
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, messagesEndRef])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingIndicator />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => router.push('/admin/conversations')}
          className="px-4 py-2 bg-neutral-500 text-white rounded-md hover:bg-neutral-600 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-neutral-500">Conversation non trouvée</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header avec retour */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/conversations')}
          className="cursor-pointer flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Retour aux conversations</span>
        </button>
      </div>
      
      {/* Infos conversation */}
      <div className="bg-neutral-100 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {conversation.title || 'Conversation sans titre'}
            </h1>
            <div className="text-xs text-neutral-500 flex flex-col">
              <span>ID: {conversation.id}</span>
              <span>Utilisateur: {conversation.user_mail || conversation.user_id?.substring(0, 8)}</span>
              <span>Date: {new Date(conversation.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des messages */}
      <div className="flex-1 flex flex-col gap-4">
        <MessageList 
          messages={messages} 
          isLoading={false}
          messagesEndRef={messagesEndRef}
          isAdminView={true}
          userEmail={conversation.user_mail}
        />
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
