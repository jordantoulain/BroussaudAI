'use client'

import { useRef, useEffect } from 'react'
import Message from './Message'
import LoadingIndicator from './LoadingIndicator'

/**
 * Composant organisme pour afficher la liste des messages avec scroll automatique
 * 
 * @param {Object} props
 * @param {Array} props.messages - Tableau de messages à afficher
 * @param {boolean} props.isLoading - Si vrai, affiche l'indicateur de chargement
 * @param {import('react').RefObject} [props.messagesEndRef] - Référence pour le scroll automatique
 * @param {boolean} [props.isAdminView] - Si vrai, désactive le masque de dégradé
 * @param {string} [props.userEmail] - Email de l'utilisateur à afficher au lieu de "Vous"
 * @param {import('react').RefObject} [props.messagesContainerRef] - Référence pour le conteneur de détection de scroll
 * @param {boolean} [props.showScrollButton] - Si vrai, affiche le bouton de défilement
 * @param {function} [props.onScroll] - Callback pour la détection de scroll
 * @returns {JSX.Element}
 */
export default function MessageList({ 
  messages, 
  isLoading, 
  messagesEndRef, 
  isAdminView, 
  userEmail,
  messagesContainerRef,
  showScrollButton,
  onScroll
}) {
  // Transmettre le callback de scroll au conteneur
  useEffect(() => {
    const container = messagesContainerRef?.current
    if (!container || !onScroll) return

    const handleScroll = () => {
      onScroll(container)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [messagesContainerRef, onScroll])

  return (
    <div 
      ref={messagesContainerRef}
      className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 scrollbar-none [&::-webkit-scrollbar]:hidden ${!isAdminView ? 'mask-[linear-gradient(to_bottom,transparent,black_10%,black)] md:mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]' : ''}`}
    >
      {/* Liste des messages */}
      <div className="w-full flex flex-col gap-2 pt-10">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} userEmail={userEmail} isAdminView={isAdminView} />
        ))}
      </div>
      
      {/* Indicateur de chargement */}
      {isLoading && <LoadingIndicator />}
      
      {/* Référence pour le scroll automatique */}
      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  )
}
