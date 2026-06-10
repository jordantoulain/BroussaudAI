'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/services/api'
import { TableRowSkeleton, TextSkeleton } from '@/components/shared'
import { ChevronLeft, ChevronRight, TriangleAlert, Search, Plus, Pencil, Trash2, X } from 'lucide-react'
import SideCanvas from '@/components/admin/SideCanvas'
import UserForm from '@/components/admin/UserForm'
import DeleteModal from '@/components/admin/DeleteModal'

/**
 * Page de gestion des membres avec pagination
 * 
 * @returns {JSX.Element}
 */
export default function AdminMembersPage() {
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  
  // CRUD states
  const [showCreateCanvas, setShowCreateCanvas] = useState(false)
  const [showEditCanvas, setShowEditCanvas] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      const fetchedUsers = response.data.users || []
      setAllUsers(fetchedUsers)
      setTotalUsers(fetchedUsers.length)
      setUsers(fetchedUsers)
      setTotalPages(Math.ceil(fetchedUsers.length / itemsPerPage))
    } catch (err) {
      console.error('Erreur chargement membres:', err)
      setError('Impossible de charger les membres')
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Appliquer recherche et pagination
  useEffect(() => {
    const filteredUsers = allUsers.filter(user =>
      user.mail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setTotalUsers(filteredUsers.length)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)
    setUsers(paginatedUsers)
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage))
  }, [allUsers, searchTerm, currentPage, itemsPerPage])

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
  const handleCreateUser = useCallback(async (userData) => {
    setActionLoading(true)
    setActionError(null)
    try {
      const response = await api.post('/admin/users', userData)
      setActionSuccess('Utilisateur créé avec succès')
      fetchUsers()
      setShowCreateCanvas(false)
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de la création')
    } finally {
      setActionLoading(false)
    }
  }, [fetchUsers])

  const handleUpdateUser = useCallback(async (userData) => {
    if (!editingUser) return
    setActionLoading(true)
    setActionError(null)
    try {
      const response = await api.put(`/admin/users/${editingUser.id}`, userData)
      setActionSuccess('Utilisateur modifié avec succès')
      fetchUsers()
      setShowEditCanvas(false)
      setEditingUser(null)
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de la modification')
    } finally {
      setActionLoading(false)
    }
  }, [editingUser, fetchUsers])

  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return
    setActionLoading(true)
    setActionError(null)
    try {
      await api.delete(`/admin/users/${userToDelete.id}`)
      setActionSuccess('Utilisateur supprimé avec succès')
      fetchUsers()
      setShowDeleteModal(false)
      setUserToDelete(null)
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }, [userToDelete, fetchUsers])

  const openEditCanvas = useCallback((user) => {
    setEditingUser(user)
    setShowEditCanvas(true)
  }, [])

  const openDeleteModal = useCallback((user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }, [])

  const closeAll = useCallback(() => {
    setShowCreateCanvas(false)
    setShowEditCanvas(false)
    setEditingUser(null)
    setShowDeleteModal(false)
    setUserToDelete(null)
    setActionError(null)
    setActionSuccess(null)
  }, [])

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
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
                <th className="px-6 py-4"><TextSkeleton widthClass="w-20" className="h-4" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} cells={7} />
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
        <h1 className="text-2xl font-bold text-neutral-800">Membres ({totalUsers})</h1>
        
        {/* Bouton Créer */}
        <button
          onClick={() => setShowCreateCanvas(true)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Créer un utilisateur
        </button>
      </div>
      
      {/* Notifications */}
      {actionError && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded-xl flex items-center gap-3">
          <TriangleAlert className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}
      
      {actionSuccess && (
        <div className="mb-4 p-4 bg-green-500 text-white rounded-xl flex items-center gap-3">
          <span>{actionSuccess}</span>
        </div>
      )}
      
      {/* Barre de recherche */}
      <div className="relative mb-3">
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
      
      {/* Tableau des membres */}
      <div className="bg-neutral-100 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="">
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Initiales</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">UUID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-neutral-100">
            {users.length > 0 ? (
              users.map((user) => {
                const initials = (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase()
                return (
                  <tr key={user.id} className="hover:bg-neutral-200/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-red-500' : 'bg-violet-500'} rounded-md`}>
                        <span className="font-medium text-white text-md">{initials}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800">{user.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">{user.prenom}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{user.mail}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditCanvas(user)}
                          className="p-2 cursor-pointer text-neutral-600 hover:text-violet-500 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 cursor-pointer text-neutral-600 hover:text-red-500 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-sm text-neutral-500">
                  Aucun membre trouvé
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
      
      {/* Side Canvas pour création */}
      <SideCanvas
        isOpen={showCreateCanvas}
        onClose={closeAll}
        title="Créer un membre"
      >
        <UserForm
          user={null}
          onSubmit={handleCreateUser}
          onCancel={closeAll}
          loading={actionLoading}
        />
      </SideCanvas>
      
      {/* Side Canvas pour modification */}
      <SideCanvas
        isOpen={showEditCanvas}
        onClose={closeAll}
        title="Modifier le membre"
      >
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={closeAll}
          loading={actionLoading}
        />
      </SideCanvas>
      
      {/* Modale de suppression */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={closeAll}
        onConfirm={handleDeleteUser}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer"
        itemName={userToDelete ? `${userToDelete.prenom} ${userToDelete.nom}` : ''}
      />
    </div>
  )
}
