'use client'

import { History } from 'lucide-react'
import ConversationItem from './ConversationItem'
import { Skeleton, TextSkeleton } from '@/components/shared'

/**
 * Composant molécule pour afficher la liste des conversations
 * 
 * @param {Object} props
 * @param {Array} props.conversations - Tableau des conversations
 * @param {string} props.activeConversationId - ID de la conversation active
 * @param {function} props.onSelectConversation - Handler pour la sélection d'une conversation
 * @param {function} props.onDeleteConversation - Handler pour la suppression d'une conversation
 * @param {boolean} [props.isLoading=false] - État de chargement
 * @returns {JSX.Element}
 */
export default function ConversationList({ 
  conversations = [], 
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isLoading = false 
}) {
  if (isLoading) {
    return (
      <div className="mt-6 flex-1">
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Historique
        </p>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="px-3 py-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-sm" />
                <div className="flex-1 flex flex-col gap-1">
                  <TextSkeleton widthClass="w-3/4" />
                  <TextSkeleton widthClass="w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="mt-6 flex-1">
      <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
        <History className="w-3.5 h-3.5" />
        Historique
      </p>
      <div className="space-y-1">
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation?.(conversation.id)}
              onDelete={onDeleteConversation}
            />
          ))
        ) : (
          <p className="text-neutral-500 text-sm px-3 py-2">
            Aucune conversation
          </p>
        )}
      </div>
    </div>
  )
}
