'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, FileText, MessageCircle } from 'lucide-react'
import TagBadge from './TagBadge'
import MessageMeta from './MessageMeta'
import ReviewModal from './ReviewModal'
import ApexChartComponent from './ApexChartComponent'
import { formatResponseText } from '@/utils/formatText'
import { parseTextWithCharts } from '@/utils/chartParser'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

/**
 * Nettoie le texte pour préparer l'affichage markdown
 * Remplace les balises HTML par leur équivalent markdown
 */
function prepareMarkdownText(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  let cleaned = text
  
  // Remplacer les balises HTML par du markdown
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n\n')
  cleaned = cleaned.replace(/<\/p>/gi, '\n\n')
  cleaned = cleaned.replace(/<p>/gi, '')
  
  // Remplacer les espaces insécables
  cleaned = cleaned.replace(/&nbsp;/gi, ' ')
  
  return cleaned
}

/**
 * Retourne la classe de couleur Tailwind en fonction du niveau de confiance
 * @param {number} confidence - Niveau de confiance (0-100)
 * @returns {string} Classe de couleur Tailwind
 */
function getConfidenceColor(confidence) {
  const confidenceValue = typeof confidence === 'number' ? confidence : 50
  if (confidenceValue >= 80) return 'bg-green-400'
  if (confidenceValue >= 60) return 'bg-yellow-400'
  if (confidenceValue >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

/**
 * Composant pour rendre le contenu avec markdown et graphiques intégrés
 */
function MessageContent({ text }) {
  const parsedContent = useMemo(() => parseTextWithCharts(text), [text])

  if (!parsedContent || parsedContent.length === 0) {
    return null
  }

  return (
    <>
      {parsedContent.map((item, index) => {
        if (item.type === 'chart') {
          return <ApexChartComponent key={`chart-${index}`} config={item.content} className="my-4" />
        }
        return (
          <ReactMarkdown 
            key={`text-${index}`}
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
          >
            {item.content}
          </ReactMarkdown>
        )
      })}
    </>
  )
}

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
 * @param {number} [props.message.data.confidence] - Niveau de confiance (0-100)
 * @param {Object} [props.message.data.file] - Fichier associé au message
 * @param {string} [props.message.data.file.name] - Nom du fichier
 * @param {string} [props.message.data.file.url] - URL du fichier
 * @param {string} [props.userEmail] - Email de l'utilisateur à afficher au lieu de "Vous"
 * @returns {JSX.Element}
 */
export default function Message({ message, userEmail, isAdminView = false }) {
  const { id, isClient, text, data } = message
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const handleOpenReviewModal = useCallback(() => {
    setIsReviewModalOpen(true)
  }, [])

  const handleCloseReviewModal = useCallback(() => {
    setIsReviewModalOpen(false)
  }, [])

  const handleReviewSubmit = useCallback(() => {
    // Optionnel : rafraîchir ou afficher une notification
    handleCloseReviewModal()
  }, [handleCloseReviewModal])
  
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
        <MessageMeta label={data?.label || message.label} subLabel={data?.sub_label || message.sub_label} />
        
        {/* Réponse avec icônes de contexte et avis */}
        <div className="flex items-start gap-2">
          <div className="flex-1 text-neutral-800 font-light markdown-content">
            <MessageContent text={prepareMarkdownText(data?.answer || data?.response || message.response || text || '')} />
          </div>
          
        {/* Icônes de droite (contexte et avis) */}
        <div className="relative flex flex-col gap-2 flex-shrink-0">
          {/* Icône loupe avec tooltip contextes et confiance */}
          {(data?.contexts || message.contexts || data?.confidence !== undefined || message.confidence !== undefined) && (
            <div className="relative group">
              <Search className="w-4 h-4 text-neutral-500 cursor-help hover:text-orange-500 transition-colors" />
              <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-3 bg-neutral-800 text-white text-xs rounded-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {/* Niveau de confiance */}
                {(data?.confidence !== undefined || message.confidence !== undefined) && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Confiance:</span>
                      <span className="text-white">
                        {data?.confidence || message.confidence || 50}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getConfidenceColor(data?.confidence || message.confidence || 50)}`}
                        style={{ width: `${data?.confidence || message.confidence || 50}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Contextes */}
                {(data?.contexts || message.contexts || []).length > 0 && (
                  <div>
                    <span className="font-medium">Sources:</span>
                    {(data?.contexts || message.contexts || []).map((context, index) => (
                      <div key={index} className="mt-1">
                        {context}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Bouton avis - pas pour le message de bienvenue et pas en mode admin */}
          {!isAdminView && id !== 'welcome-message' && (
            <button
              onClick={handleOpenReviewModal}
              className="relative group"
              aria-label="Donner un avis"
            >
              <MessageCircle className="cursor-pointer w-4 h-4 text-neutral-500 hover:text-orange-500 transition-colors" />
              <span className="absolute bottom-full right-0 mb-2 w-max p-2 bg-neutral-800 text-white text-xs rounded-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Donner un avis
              </span>
            </button>
          )}
        </div>
        </div>
        
        {/* Fichier PDF à télécharger/embeddé */}
        {/* Support des deux structures : data.file ou file au niveau racine */}
        {(data?.file?.url || message.file?.url) && (
          <a
            href={data?.file?.url || message.file?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-2 p-3 pr-5 bg-neutral-50 rounded-lg w-fit hover:bg-neutral-100 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-neutral-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-violet-500 group-hover:text-violet-600 font-medium truncate block">
                  {(data?.file?.name || message.file?.name) || 'Télécharger le PDF'}
                </span>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Document PDF généré
                </div>
              </div>
            </div>
          </a>
        )}
        
        {/* Tags */}
        {data?.tags && data.tags.length > 0 && (
          <div className="md:flex hidden flex-wrap gap-2 mt-1">
            {data.tags.map((tag, idx) => (
              <TagBadge key={idx} tag={tag} />
            ))}
          </div>
        )}
        
        {/* Modale d'avis */}
        {!isClient && (
          <ReviewModal
            isOpen={isReviewModalOpen}
            onClose={handleCloseReviewModal}
            messageId={id}
            onSubmit={handleReviewSubmit}
          />
        )}
      </div>
    </div>
  )
}
