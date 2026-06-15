'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { TableRowSkeleton, TextSkeleton, ActionError, ActionSuccess } from '@/components/shared'
import { TriangleAlert, Search, Plus, Trash2, FileText, FileJson, Grid3X3, File, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import SideCanvas from '@/components/admin/SideCanvas'
import DeleteModal from '@/components/admin/DeleteModal'
import DocumentUploadForm from '@/components/admin/DocumentUploadForm'

/**
 * Page de gestion des documents (PDF, TXT, JSON, CSV, XLSX, MD) avec pagination
 * 
 * @returns {JSX.Element}
 */
export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [allDocuments, setAllDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Helper pour obtenir l'icône et la couleur selon le type de fichier
  const getFileIcon = (filename) => {
    const ext = filename?.toLowerCase().split('.').pop()
    switch (ext) {
      case 'pdf':
        return { icon: FileText, color: 'bg-red-500' }
      case 'json':
        return { icon: FileJson, color: 'bg-yellow-500' }
      case 'csv':
        return { icon: File, color: 'bg-green-500' }
      case 'xlsx':
        return { icon: Grid3X3, color: 'bg-emerald-500' }
      case 'md':
        return { icon: FileText, color: 'bg-purple-500' }
      case 'txt':
      default:
        return { icon: FileText, color: 'bg-blue-500' }
    }
  }
  
  // CRUD states
  const [showUploadCanvas, setShowUploadCanvas] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/documents')
      const fetchedDocuments = response.data.documents || []
      setAllDocuments(fetchedDocuments)
      setTotalDocuments(fetchedDocuments.length)
      setDocuments(fetchedDocuments)
      setTotalPages(Math.ceil(fetchedDocuments.length / itemsPerPage))
    } catch (err) {
      console.error('Erreur chargement documents:', err)
      setError('Impossible de charger les documents')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Appliquer recherche et pagination
  useEffect(() => {
    const filteredDocuments = allDocuments.filter(doc =>
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setTotalDocuments(filteredDocuments.length)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage)
    setDocuments(paginatedDocuments)
    setTotalPages(Math.ceil(filteredDocuments.length / itemsPerPage))
  }, [allDocuments, searchTerm, currentPage, itemsPerPage])

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

  // Fonctions CRUD
  const handleUploadDocument = useCallback(async () => {
    setActionLoading(true)
    setActionError(null)
    try {
      await fetchDocuments()
      setShowUploadCanvas(false)
      setActionSuccess('Document uploadé avec succès')
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de l\'upload')
    } finally {
      setActionLoading(false)
    }
  }, [fetchDocuments])

  const handleDeleteDocument = useCallback(async () => {
    if (!documentToDelete) return
    setActionLoading(true)
    setActionError(null)
    try {
      // Supprimer par filename (supprime tous les chunks de ce fichier)
      await api.delete(`/admin/documents/${encodeURIComponent(documentToDelete.filename)}`)
      setActionSuccess('Document et ses chunks supprimés avec succès')
      fetchDocuments()
      setShowDeleteModal(false)
      setDocumentToDelete(null)
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }, [documentToDelete, fetchDocuments])

  const openDeleteModal = useCallback((document) => {
    setDocumentToDelete(document)
    setShowDeleteModal(true)
  }, [])

  const closeAll = useCallback(() => {
    setShowUploadCanvas(false)
    setShowDeleteModal(false)
    setDocumentToDelete(null)
    setActionError(null)
    setActionSuccess(null)
  }, [])

  // Format file size


  if (loading && currentPage === 1) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <TextSkeleton widthClass="w-48" className="h-8" />
          <div className="w-40 h-10 bg-neutral-300 rounded-xl animate-pulse" aria-hidden="true" />
        </div>
        <div className="bg-neutral-100 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cells={5} />
              ))}
            </tbody>
          </table>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Documents ({totalDocuments})</h1>
        
        {/* Bouton Upload */}
        <button
          onClick={() => setShowUploadCanvas(true)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Ajouter un document
        </button>
      </div>
      
      {/* Notifications */}
      <ActionError message={actionError} />
      <ActionSuccess message={actionSuccess} />
      
      {/* Barre de recherche */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-neutral-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom de fichier..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full sm:w-80 pl-10 pr-4 text-sm py-2 rounded-xl bg-neutral-100 text-neutral-800 placeholder-neutral-500 outline-none transition-colors"
        />
      </div>
      
      {/* Tableau des documents */}
      <div className="bg-neutral-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="">
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nom du fichier</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Chunks</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-neutral-100">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <tr key={doc.filename} className="hover:bg-neutral-200/50 transition-colors">
                  <td className="px-6 py-4">
                    {(() => {
                      const { icon: Icon, color } = getFileIcon(doc.filename)
                      return (
                        <div className={`w-8 h-8 flex items-center justify-center ${color} rounded-md`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">
                    {doc.filename || 'inconnu'}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {doc.chunk_count || 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDeleteModal(doc)}
                        className="p-2 cursor-pointer text-neutral-600 hover:text-red-500 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-sm text-neutral-500">
                  Aucun document trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
      
      {/* Side Canvas pour upload */}
      <SideCanvas
        isOpen={showUploadCanvas}
        onClose={closeAll}
        title="Upload un document"
      >
        <DocumentUploadForm
          onSubmit={handleUploadDocument}
          onCancel={closeAll}
          loading={actionLoading}
          accept=".pdf,.txt,.json,.csv,.xlsx,.md"
        />
      </SideCanvas>
      
      {/* Modale de suppression */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeAll}
        onConfirm={handleDeleteDocument}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer"
        itemName={documentToDelete ? documentToDelete.filename : ''}
      />
    </div>
  )
}
