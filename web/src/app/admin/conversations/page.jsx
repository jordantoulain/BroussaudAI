'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/api'
import { ConversationCardSkeleton, TextSkeleton } from '@/components/shared'
import { ChevronLeft, ChevronRight, Search, Trash, Check, Funnel } from 'lucide-react'

/**
 * Page des conversations avec pagination
 * Clic sur une conversation → redirection vers /admin/conversations/[id]
 * 
 * @returns {JSX.Element}
 */
export default function AdminConversationsPage() {
  const router = useRouter()
  const [allConversations, setAllConversations] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalConversations, setTotalConversations] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({ labels: [], subLabels: [], tags: [] })
  const [availableFilters, setAvailableFilters] = useState({ labels: [], subLabels: [], tags: [] })
  const [allMessages, setAllMessages] = useState([])
  const [users, setUsers] = useState([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Récupérer les utilisateurs et les conversations en parallèle
      const [usersResponse, convResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/conversations')
      ])
      
      const allUsers = usersResponse.data.users || []
      const allConv = convResponse.data.conversations || []
      
      setUsers(allUsers)
      setAllConversations(allConv)
      setTotalConversations(allConv.length)
      
      // Initialiser avec toutes les conversations
      setConversations(allConv)
      setTotalPages(Math.ceil(allConv.length / itemsPerPage))
      
      // Essayer de récupérer les messages pour les filtres
      try {
        const msgResponse = await api.get('/admin/messages')
        const allMsg = msgResponse.data.messages || []
        setAllMessages(allMsg)
        
        // Extraire les filtres uniques
        const labels = [...new Set(allMsg.map(m => m.label).filter(Boolean))]
        const subLabels = [...new Set(allMsg.map(m => m.sub_label).filter(Boolean))]
        const tags = [...new Set(allMsg.flatMap(m => m.tags || []).filter(Boolean))]
        
        setAvailableFilters({ labels, subLabels, tags })
      } catch (msgErr) {
        if (msgErr.response?.status !== 404) {
          throw msgErr
        }
        // Endpoint /admin/messages n'existe pas, continuer sans filtres
      }
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setError('Impossible de charger les conversations')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Créer une map des utilisateurs pour un accès rapide
  const usersMap = useMemo(() => {
    const map = {}
    users.forEach(user => {
      map[user.id] = user
    })
    return map
  }, [users])

  // Appliquer filtres et pagination
  useEffect(() => {
    // Filtrer les conversations par recherche texte
    let filtered = allConversations.filter(conv => {
      const searchLower = searchTerm.toLowerCase()
      const user = usersMap[conv.user_id]
      const formattedDate = new Date(conv.created_at).toLocaleDateString('fr-FR')
      return (
        (conv.title || '').toLowerCase().includes(searchLower) ||
        (conv.user_mail || '').toLowerCase().includes(searchLower) ||
        (conv.user_id || '').toLowerCase().includes(searchLower) ||
        (user?.nom || '').toLowerCase().includes(searchLower) ||
        (user?.prenom || '').toLowerCase().includes(searchLower) ||
        conv.id.toLowerCase().includes(searchLower) ||
        formattedDate.toLowerCase().includes(searchLower)
      )
    })
    
    // Filtrer par labels/sub_labels/tags sélectionnés (uniquement si on a les messages)
    if (allMessages.length > 0 && (selectedFilters.labels.length > 0 || selectedFilters.subLabels.length > 0 || selectedFilters.tags.length > 0)) {
      filtered = filtered.filter(conv => {
        // Trouver les messages de cette conversation
        const convMessages = allMessages.filter(m => m.conversation_id === conv.id)
        
        // Vérifier si au moins un message match un des filtres
        return convMessages.some(msg => {
          return (
            (selectedFilters.labels.length > 0 && selectedFilters.labels.includes(msg.label)) ||
            (selectedFilters.subLabels.length > 0 && selectedFilters.subLabels.includes(msg.sub_label)) ||
            (selectedFilters.tags.length > 0 && msg.tags && msg.tags.some(tag => selectedFilters.tags.includes(tag)))
          )
        })
      })
    } else if (allMessages.length === 0 && (selectedFilters.labels.length > 0 || selectedFilters.subLabels.length > 0 || selectedFilters.tags.length > 0)) {
      // Si on a des filtres sélectionnés mais pas de messages chargés, afficher un message
    }
    
    setTotalConversations(filtered.length)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    setConversations(paginated)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
  }, [allConversations, allMessages, searchTerm, selectedFilters, currentPage, itemsPerPage, users])

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [currentPage, itemsPerPage, totalPages])

  const handleItemsPerPageChange = useCallback((e) => {
    const newPerPage = parseInt(e.target.value, 10)
    setItemsPerPage(newPerPage)
    setCurrentPage(1)
  }, [])
  
  const toggleFilter = useCallback((type, value) => {
    setSelectedFilters(prev => {
      const current = prev[type] || []
      const newArray = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [type]: newArray }
    })
    setCurrentPage(1)
  }, [])
  
  const clearFilters = useCallback(() => {
    setSelectedFilters({ labels: [], subLabels: [], tags: [] })
    setCurrentPage(1)
  }, [])
  
  const toggleFilterDropdown = useCallback(() => {
    setShowFilterDropdown(prev => !prev)
  }, [])
  
  const closeFilterDropdown = useCallback(() => {
    setShowFilterDropdown(false)
  }, [])

  if (loading && currentPage === 1) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <TextSkeleton widthClass="w-64" className="h-8" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-3">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
              <TextSkeleton widthClass="w-10" className="h-4" />
            </div>
            <div className="w-full h-10 bg-neutral-100 rounded-xl animate-pulse" aria-hidden="true" />
          </div>
          <div className="relative">
            <div className="w-32 h-10 bg-neutral-100 rounded-xl animate-pulse" aria-hidden="true" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <ConversationCardSkeleton key={i} />
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
              <TriangleAlert className="w-4 h-4"/>
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
        <h1 className="text-2xl font-bold text-neutral-800">Conversations ({totalConversations})</h1>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-3">
        {/* Recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full sm:w-80 pl-10 pr-4 text-sm py-2 rounded-xl bg-neutral-100 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
          />
        </div>
        
        {/* Dropdown des filtres */}
        <div className="relative">
          <button
            onClick={toggleFilterDropdown}
            disabled={availableFilters.labels.length === 0 && availableFilters.subLabels.length === 0 && availableFilters.tags.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-colors whitespace-nowrap ${
              availableFilters.labels.length === 0 && availableFilters.subLabels.length === 0 && availableFilters.tags.length === 0
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer'
            }`}
          >
            <Funnel className="w-4 h-4 text-neutral-400" />
            {(selectedFilters.labels.length > 0 || selectedFilters.subLabels.length > 0 || selectedFilters.tags.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </button>
          
          {showFilterDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={closeFilterDropdown}
              />
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-lg z-20 p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-neutral-800">Filtrer par</h3>
                  <button
                    onClick={clearFilters}
                    className="cursor-pointer text-sm text-red-500 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Labels */}
                {availableFilters.labels.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-600 mb-2">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.labels.map(label => (
                        <button
                          key={label}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFilter('labels', label)
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                            selectedFilters.labels.includes(label) 
                              ? 'bg-green-500 text-white' 
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {selectedFilters.labels.includes(label) && <Check className="w-3 h-3" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sub Labels */}
                {availableFilters.subLabels.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-neutral-600 mb-2">Sous-catégories</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.subLabels.map(subLabel => (
                        <button
                          key={subLabel}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFilter('subLabels', subLabel)
                          }}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                            selectedFilters.subLabels.includes(subLabel) 
                              ? 'bg-green-500 text-white' 
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {selectedFilters.subLabels.includes(subLabel) && <Check className="w-3 h-3" />}
                          {subLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tags */}
                {availableFilters.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-600 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleFilter('tags', tag)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors ${
                            selectedFilters.tags.includes(tag) 
                              ? 'bg-green-500 text-white' 
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {selectedFilters.tags.includes(tag) && <Check className="w-3 h-3" />}
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {(availableFilters.labels.length === 0 && availableFilters.subLabels.length === 0 && availableFilters.tags.length === 0) && (
                  <p className="text-sm text-neutral-500 text-center py-4">Aucun filtre disponible</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Liste des conversations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const user = usersMap[conv.user_id]
            const initials = user ? (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase() : '?'
            const displayDate = new Date(conv.created_at).toLocaleString('fr-FR')
            return (
              <div 
                key={conv.id} 
                className="bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:bg-neutral-200 transition-colors"
                onClick={() => router.push(`/admin/conversations/${conv.id}`)}
              >
                {/* Header de la conversation */}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center ${user?.role === 'ADMIN' ? 'bg-red-500' : 'bg-violet-500'} rounded-md flex-shrink-0`}>
                      <span className="font-medium text-white text-md">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-800 truncate">{conv.title || 'Sans titre'}</div>
                      <div className="text-xs text-neutral-500 flex flex-col">
                        <span>ID: {conv.id}</span>
                        <span>Utilisateur: {user?.nom && user?.prenom ? `${user.prenom} ${user.nom}` : conv.user_mail || conv.user_id}</span>
                        <span>UUID: {conv.user_id}</span>
                        <span>Date: {displayDate}</span>
                        <span>Statut: {conv.is_active ? 'Active' : 'Archivée'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="md:col-span-2 bg-neutral-100 rounded-lg p-8 text-center">
            <div className="text-neutral-500">Aucune conversation trouvée</div>
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
              onChange={handleItemsPerPageChange}
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-neutral-300 rounded-md bg-neutral-200 hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-neutral-600">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-neutral-300 rounded-md bg-neutral-200 hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
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
