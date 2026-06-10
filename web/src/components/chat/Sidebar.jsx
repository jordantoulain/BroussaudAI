'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import NavigationSelector from './NavigationSelector'
import NewConversationButton from './NewConversationButton'
import ConversationList from './ConversationList'
import UserProfile from './UserProfile'
import SidebarCollapsed from './SidebarCollapsed'
import { PanelLeftClose, Archive } from 'lucide-react'

/**
 * Composant container pour la sidebar du chat
 * 
 * @param {Object} props
 * @param {string} props.currentPage - Page actuellement sélectionnée
 * @param {function} props.onNewConversation - Callback pour nouvelle conversation
 * @param {Object} props.userInfo - Informations de l'utilisateur
 * @param {Array} [props.conversations=[]] - Liste des conversations
 * @param {string} [props.activeConversationId] - ID de la conversation active
 * @param {function} props.onSelectConversation - Callback pour sélectionner une conversation
 * @param {function} props.onDeleteConversation - Callback pour supprimer une conversation
 * @param {boolean} props.isMobile - Indique si l'affichage est mobile
 * @param {boolean} props.isCollapsed - Indique si la sidebar est réduite
 * @param {function} props.onToggle - Callback pour basculer l'affichage
 * @param {function} props.onClose - Callback pour fermer la sidebar sur mobile
 * @param {boolean} [props.isLoading=false] - État de chargement du profil et de l'historique
 * @returns {JSX.Element}
 */
export default function Sidebar({
  currentPage,
  onNewConversation,
  userInfo,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isMobile,
  isCollapsed,
  onToggle,
  onClose,
  isLoading = false
}) {

  const isOverlayOpen = isMobile && !isCollapsed

  return (
    <>
      {/* Sidebar principale avec animation - toujours fixed sur mobile */}
      <aside className={`bg-neutral-100 h-full overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-64'} ${isMobile ? 'fixed left-0 top-0 z-50' : ''}`}>
        {isCollapsed ? (
          <SidebarCollapsed 
            currentPage={currentPage} 
            userInfo={userInfo}
            onToggle={onToggle}
            isLoading={isLoading}
          />
        ) : (
          <div className="p-4 h-full flex flex-col gap-2">
            {/* Header avec bouton de fermeture pour mobile */}
            {isMobile && (
              <button 
                onClick={onClose}
                className="flex shrink-0 cursor-pointer items-center justify-center w-full px-2 pr-3 py-2 rounded-lg hover:bg-neutral-300 transition-colors text-neutral-800 mb-4"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className='stroke-1'/>
              </button>
            )}
            
            {/* Sélecteur de navigation */}
            <div className="shrink-0">
              <NavigationSelector 
                currentPage={currentPage}
                role={userInfo?.role}
              />
            </div>
            
            {/* Bouton Mes archives */}
            <div className="shrink-0">
              <Link
                href="/chat/archives"
                className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-neutral-900 w-full text-left"
              >
                <Archive className="w-4 h-4" />
                <span className="text-sm">Archives</span>
              </Link>
            </div>
            
            {/* Bouton nouvelle conversation */}
            <div className="shrink-0">
              <NewConversationButton onClick={onNewConversation} />
            </div>
            
            {/* Liste des conversations */}
            <div className="shrink-0 flex-1">
              <ConversationList 
                conversations={conversations} 
                activeConversationId={activeConversationId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={onDeleteConversation}
                isLoading={isLoading}
              />
            </div>
            
            {/* Profil utilisateur */}
            <div className="shrink-0">
              <UserProfile userInfo={userInfo} isLoading={isLoading} />
            </div>
          </div>
        )}
      </aside>
      
      {/* Overlay pour mobile */}
      {isMobile && isOverlayOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-xs z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        />
      )}
    </>
  )
}
