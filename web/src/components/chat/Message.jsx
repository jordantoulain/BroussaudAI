'use client'

import { Search } from 'lucide-react'
import TagBadge from './TagBadge'
import MessageMeta from './MessageMeta'
import { formatResponseText } from '@/utils/formatText'

/**
 * Composant molécule pour afficher un message (utilisateur ou IA)
 * 
 * @param {Object} props
 * @param {Object} props.message - Objet message à afficher
 * @param {number} props.message.id - Identifiant du message
 * @param {boolean} props.message.isClient - Si vrai, message de l'utilisateur
 * @param {string} [props.message.text] - Texte du message (pour les messages utilisateur)
 * @param {Object} [props.message.data] - Données du message (pour les messages IA)
 * @param {string} [props.message.data.answer] - Réponse IA
 * @param {string} [props.message.data.label] - Label du message
 * @param {string} [props.message.data.sub_label] - Sous-label du message
 * @param {string[]} [props.message.data.tags] - Tags du message
 * @param {string[]} [props.message.data.contexts] - Liste des contextes/fichiers utilisés
 * @param {string} [props.userEmail] - Email de l'utilisateur à afficher au lieu de "Vous"
 * @returns {JSX.Element}
 */
export default function Message({ message, userEmail }) {
  const { id, isClient, text, data } = message
  
  if (isClient) {
    // Message utilisateur
    return (
      <div
        key={id}
        className="w-full sm:w-fit sm:max-w-[85%] text-sm sm:text-base leading-relaxed self-end ml-auto mb-2 bg-orange-400 font-normal text-white px-4 sm:px-5 pb-1.5 pt-2 rounded-2xl"
      >
        <div className="flex flex-col gap-0">
          <span className="ml-auto text-xs font-light tracking-widest opacity-80">{userEmail || 'Vous'}</span>
          {text}
        </div>
      </div>
    )
  }
  
  // Message IA
  return (
    <div
      key={id}
      className="w-full sm:w-fit sm:max-w-[85%] text-sm sm:text-base leading-relaxed self-start mr-auto mb-2 bg-neutral-200 text-neutral-800 px-4 sm:px-5 py-3 sm:py-5 rounded-2xl"
    >
      <div className="flex flex-col gap-3">
        {/* Métadonnées (label, sous-label) */}
        <MessageMeta label={data?.label} subLabel={data?.sub_label} />
        
        {/* Réponse avec icône de contexte */}
        <div className="flex items-start gap-2">
          <div className="flex-1 text-neutral-800 font-light">
            {formatResponseText(data?.answer || text)}
          </div>
          
        {/* Icône loupe avec tooltip contextes */}
        {data?.contexts && data.contexts.length > 0 && (
          <div className="relative group flex-shrink-0">
            <Search className="w-4 h-4 text-neutral-500 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-max p-2 bg-neutral-100 text-neutral-800 text-xs rounded-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {data.contexts.map((context, index) => (
                <div key={index} className="mb-1 last:mb-0">
                  {context}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        
        {/* Tags */}
        {data?.tags && data.tags.length > 0 && (
          <div className="md:flex hidden flex-wrap gap-2 mt-1">
            {data.tags.map((tag, idx) => (
              <TagBadge key={idx} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
