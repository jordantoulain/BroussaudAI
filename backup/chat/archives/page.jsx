'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/api'
import { ConversationCardSkeleton, TextSkeleton } from '@/components/shared'
import { ChevronLeft, ChevronRight, Search, ArchiveRestore } from 'lucide-react'
import { useUserInfo } from '@/hooks/useUserInfo'

/**
 * Page des archives - conversations supprimées de l'utilisateur
 * 
 * @returns {JSX.Element}
 */
export default function ChatArchivesPage() {
  const router = useRouter()
  const { userInfo } = useUserInfo()
  const [allArchivedConversations, setAllArchivedConversations] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalConversations, setTotalConversations] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [usersMap, setUsersMap] = useState({})

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Récupérer les utilisateurs pour les initiales
      const usersResponse = await api.get('/admin/users')
      const allUsers = usersResponse.data.users || []
      const usersMap = {}
      allUsers.forEach(user => {
        usersMap[user.id] = user
      })
      setUsersMap(usersMap)
      
      // Récupérer les conversations archivées (soft deleted) de l'utilisateur
      const convResponse = await api.get('/admin/conversations')
      const allConv = convResponse.data.conversations || []
      
      // Filtrer : uniquement celles de l'utilisateur et supprimées (deleted_at IS NOT NULL)
      const archivedConv = allConv.filter(conv => 
        conv.user_id === userInfo?.id && 
        conv.deleted_at !== null &&
        conv.deleted_at !== undefined
      )
      
      setAllArchivedConversations(archivedConv)
      setTotalConversations(archivedConv.length)
      setConversations(archivedConv)
      setTotalPages(Math.ceil(archivedConv.length / itemsPerPage))
      
    } catch (err) {
      console.error('Erreur chargement archives:', err)
      setError('Impossible de charger les archives')
    } finally {
      setLoading(false)
    }
  }, [userInfo, itemsPerPage])

  useEffect(() => {
    if (userInfo) {
      fetchData()
    }
  }, [userInfo, fetchData])

  // Appliquer recherche et pagination
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase()
    let filtered = allArchivedConversations.filter(conv => {
      const user = usersMap[conv.user_id]
      const formattedDate = new Date(conv.created_at).toLocaleString('fr-FR')
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
    
    setTotalConversations(filtered.length)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage)
    setConversations(paginated)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
  }, [allArchivedConversations, usersMap, searchTerm, currentPage, itemsPerPage])

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

  const handleRestoreConversation = useCallback(async (convId) => {
    try {
      await api.post(`/admin/conversations/${convId}/restore`)
      await fetchData()
    } catch (err) {
      console.error('Erreur restauration conversation:', err)
    }
  }, [fetchData])

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
        <h1 className="text-2xl font-bold text-neutral-800">Mes archives ({totalConversations})</h1>
      </div>
      
      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-4 mb-3">
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
      </div>
      
      {/* Liste des conversations archivées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const user = usersMap[conv.user_id]
            const initials = user ? (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase() : '?'
            const displayDate = new Date(conv.created_at).toLocaleString('fr-FR')
            return (
              <div 
                key={conv.id} 
                className="bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:bg-neutral-200 transition-colors relative"
                onClick={() => router.push(`/chat?conversation_id=${conv.id}`)}
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
                        <span>Date: {displayDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bouton de restauration */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestoreConversation(conv.id)
                  }}
                  className="absolute top-2 right-2 p-1.5 cursor-pointer text-neutral-600 hover:text-green-500 rounded-lg transition-colors"
                  title="Restaurer"
                >
                  <ArchiveRestore className="w-4 h-4" />
                </button>
              </div>
            )
          })
        ) : (
          <div className="md:col-span-2 bg-neutral-100 rounded-lg p-8 text-center">
            <div className="text-neutral-500">Aucune archive trouvée</div>
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
              className="p-2 border border-neutral-300 bg-neutral-200 rounded-md hover:bg-neutral-100 cursor-pointer disabled:cursor-not-allowed"
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
