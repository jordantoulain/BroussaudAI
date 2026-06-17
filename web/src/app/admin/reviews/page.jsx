'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/api'
import { TextSkeleton } from '@/components/shared'
import { ThumbsUp, ThumbsDown, Search, MessageSquare, Forward, ChevronLeft, ChevronRight } from 'lucide-react'
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
 * Page d'administration des avis
 * Affichage en lecture seule de tous les avis utilisateurs
 * 
 * @returns {JSX.Element}
 */
export default function AdminReviewsPage() {
  const [allReviews, setAllReviews] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState(null) // null = tous, true = positif, false = négatif
  const [currentPage, setCurrentPage] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)

  const router = useRouter()

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/reviews')
      setAllReviews(response.data.reviews || [])
      setReviews(response.data.reviews || [])
    } catch (err) {
      console.error('Erreur chargement avis:', err)
      setError(err.response?.data?.detail || 'Impossible de charger les avis')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Appliquer recherche, filtre de rating et pagination
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase()
    
    let filtered = allReviews.filter(review => {
      const userName = `${review.user_prenom || ''} ${review.user_nom || ''}`.trim().toLowerCase()
      const userMail = (review.user_mail || '').toLowerCase()
      const formattedDate = new Date(review.created_at).toLocaleString('fr-FR')
      const description = (review.description || '').toLowerCase()
      const messageContent = (review.message_content || '').toLowerCase()
      
      return (
        userName.includes(searchLower) ||
        userMail.includes(searchLower) ||
        review.user_id?.toLowerCase().includes(searchLower) ||
        review.id?.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) ||
        description.includes(searchLower) ||
        review.message_id?.toString().includes(searchLower) ||
        messageContent.includes(searchLower) ||
        review.conversation_id?.toLowerCase().includes(searchLower)
      )
    })
    
    // Filtrer par rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating)
    }
    
    // Appliquer pagination
    setTotalReviews(filtered.length)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    setReviews(paginated)
  }, [allReviews, searchTerm, filterRating, currentPage, itemsPerPage])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const getRatingLabel = (rating) => {
    return rating ? 'Positif' : 'Négatif'
  }

  const getRatingColor = (rating) => {
    return rating ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }

  const getRatingIcon = (rating) => {
    return rating ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />
  }

  const positiveCount = allReviews.filter(r => r.rating === true).length
  const negativeCount = allReviews.filter(r => r.rating === false).length

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <TextSkeleton widthClass="w-64" className="h-8" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="bg-neutral-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-300 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-neutral-300 rounded animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-neutral-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Avis ({allReviews.length})</h1>
      </div>

      {/* Statistiques */}
      <div className="flex gap-4 mb-6">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-3">
          {positiveCount} positifs
          <ThumbsUp className="w-4 h-4" />
        </div>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-3">
          {negativeCount} négatifs
          <ThumbsDown className="w-4 h-4" />
        </div>
        <div className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium">
          Total: {allReviews.length}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par utilisateur, mail, message, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 text-sm py-2 rounded-xl bg-neutral-100 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
          />
        </div>

        {/* Filtre par rating */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRating(null)}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterRating === null
                ? 'bg-neutral-300 text-neutral-800'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterRating(true)}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filterRating === true
                ? 'bg-green-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Positifs
          </button>
          <button
            onClick={() => setFilterRating(false)}
            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              filterRating === false
                ? 'bg-red-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            Négatifs
          </button>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const userName = `${review.user_prenom || ''} ${review.user_nom || ''}`.trim()
            return (
              <div
                key={review.id}
                className="bg-neutral-100 rounded-lg p-4 hover:bg-neutral-200 transition-colors"
              >
                <div className="flex flex-col gap-4">
                  {/* Header avec utilisateur, date et bouton conversation */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar placeholder */}
                      <div className={`w-10 h-10 flex items-center justify-center rounded-md ${review.user_role === 'ADMIN' ? 'bg-red-500' : 'bg-violet-500'} flex-shrink-0`}>
                        <span className="font-medium text-white text-sm">
                          {userName ? (userName.charAt(0) + (review.user_nom?.charAt(0) || '')).toUpperCase() : '?'}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-800 truncate">
                          {userName || review.user_mail || review.user_id || 'Utilisateur inconnu'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          ID: {review.user_id} | Message ID: {review.message_id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-neutral-600">
                        {formatDate(review.created_at)}
                      </div>
                      {review.conversation_id && (
                        <button
                          onClick={() => router.push(`/admin/conversations/${review.conversation_id}`)}
                          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer bg-neutral-300 text-neutral-800 hover:text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          <Forward className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contenu de l'avis */}
                  <div className="pl-13 sm:pl-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`flex gap-2 px-3 py-1.5 rounded-md text-xs font-medium ${getRatingColor(review.rating)}`}>
                        {getRatingIcon(review.rating)}
                        {getRatingLabel(review.rating)}
                      </span>
                    </div>
                    
                    {/* Message évalué */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">Message évalué</span>
                      </div>
                      <div className="text-neutral-700 bg-neutral-50 p-3 rounded-lg markdown-content">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeRaw]}
                        >
                          {prepareMarkdownText(review.message_content || 'Contenu non disponible')}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {/* Description de l'avis */}
                    {review.description && (
                      <div className="mt-3">
                        <div className="text-sm text-neutral-600 mb-2">Commentaire</div>
                        <div className="text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                          {review.description}
                        </div>
                      </div>
                    )}
                    
                    {!review.description && (
                      <div className="text-neutral-500 italic text-sm mt-2">
                        Aucun commentaire ajouté
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-neutral-100 rounded-lg p-8 text-center">
            <div className="text-neutral-500">Aucun avis trouvé</div>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Éléments par page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value, 10))
                setCurrentPage(1)
              }}
              className="text-sm border border-neutral-300 bg-neutral-200 rounded-md px-2 py-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-neutral-300 bg-neutral-200 rounded-md hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-neutral-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-neutral-300 bg-neutral-200 rounded-md hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
