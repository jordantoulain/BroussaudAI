'use client'

import { History, Pin } from 'lucide-react'
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
 * @param {function} props.onTogglePin - Handler pour épingler/désépingler une conversation
 * @param {function} props.onRenameConversation - Handler pour renommer une conversation
 * @param {boolean} [props.isLoading=false] - État de chargement
 * @returns {JSX.Element}
 */
export default function ConversationList({ 
  conversations = [], 
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  onTogglePin,
  onRenameConversation,
  isLoading = false 
}) {
  // Filtrer les conversations
  const pinnedConversations = conversations.filter(conv => conv.pinned)
  const regularConversations = conversations.filter(conv => !conv.pinned)

  const renderConversationList = (convs, title, icon) => (
    <div className="space-y-1">
      {convs.length > 0 && (
        <>
          <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            {icon}
            {title}
          </p>
          {convs.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation?.(conversation.id)}
              onDelete={onDeleteConversation}
              onTogglePin={onTogglePin}
              onRename={onRenameConversation}
            />
          ))}
        </>
      )}
    </div>
  )

  const renderSkeleton = () => (
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
  )

  if (isLoading) {
    return (
      <div className="mt-6 flex-1">
        {renderSkeleton()}
      </div>
    )
  }
  
  return (
    <div className="mt-6 flex flex-col flex-1 gap-5">
      {renderConversationList(
        pinnedConversations,
        "Épinglées",
        <Pin className="w-3.5 h-3.5" />
      )}
      {renderConversationList(
        regularConversations,
        "Historique",
        <History className="w-3.5 h-3.5" />
      )}
      {pinnedConversations.length === 0 && regularConversations.length === 0 && (
        <p className="text-neutral-500 text-sm px-3 py-2">
          Aucune conversation
        </p>
      )}
    </div>
  )
}
