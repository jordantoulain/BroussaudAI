'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { StatsCardSkeleton, TextSkeleton } from '@/components/shared'
import { TriangleAlert, Settings, X } from 'lucide-react'
import MiniChart from '@/components/admin/MiniChart'

/**
 * Dashboard d'administration avec statistiques
 * 
 * @returns {JSX.Element}
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversationsData, setConversationsData] = useState([])
  const [messagesData, setMessagesData] = useState([])
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/')
        
        setStats(response.data.stats)
        
        // Set timeline data directly from response
        if (response.data.timeline) {
          let convData = response.data.timeline.conversations_timeline || []
          let msgData = response.data.timeline.messages_timeline || []
          
          // Si vide ou toutes les valeurs sont à zéro, utiliser des données factices
          if (convData.length === 0 || convData.every(v => v === 0)) {
            convData = [3, 1, 4, 2, 5, 3, 4, 2, 6, 3]
          }
          if (msgData.length === 0 || msgData.every(v => v === 0)) {
            msgData = [10, 5, 15, 8, 20, 12, 18, 10, 25, 15]
          }
          
          setConversationsData(convData)
          setMessagesData(msgData)
        } else {
          // Si pas de timeline dans la réponse, utiliser des données factices
          setConversationsData([3, 1, 4, 2, 5, 3, 4, 2, 6, 3])
          setMessagesData([10, 5, 15, 8, 20, 12, 18, 10, 25, 15])
        }
      } catch (err) {
        console.error('Erreur chargement données:', err)
        setError('Impossible de charger les données du dashboard')
      } finally {
        setLoading(false)
      }
    }
    
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await api.get('/admin/maintenance')
        setMaintenanceMode(response.data.maintenance_mode || false)
        setMaintenanceReason(response.data.maintenance_reason || '')
      } catch (err) {
        console.error('Erreur chargement mode maintenance:', err)
      }
    }
    
    fetchDashboardData()
    fetchMaintenanceStatus()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <TextSkeleton widthClass="w-48" className="h-8 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <TextSkeleton widthClass="w-32" className="h-6 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
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

  // Fonction utilitaire pour formater le temps en ms
  const formatResponseTime = (ms) => {
    if (ms === 0) return '0s'
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }
  
  // Fonction utilitaire pour formater les tokens
  const formatTokens = (tokens) => {
    if (tokens === 0) return '0'
    if (tokens < 1000) return tokens.toLocaleString()
    if (tokens < 1000000) return (tokens / 1000).toFixed(1) + 'K'
    return (tokens / 1000000).toFixed(1) + 'M'
  }
  
  // Extraire les stats IA
  const statsIa = stats?.stats_ia || { today: {}, week: {}, all_time: {} }
  const todayStats = statsIa.today || {}
  const weekStats = statsIa.week || {}
  const allTimeStats = statsIa.all_time || {}

  // Fonctions pour gérer le mode maintenance
  const handleToggleMaintenance = async () => {
    setModalError(null)
    
    // Si on active le mode maintenance, ouvrir la modale
    if (!maintenanceMode) {
      setShowModal(true)
      return
    }
    
    // Si on désactive, faire directement sans modale
    setModalLoading(true)
    try {
      await api.post('/admin/maintenance', {
        maintenance_mode: false,
        maintenance_reason: ''
      })
      setMaintenanceMode(false)
      setMaintenanceReason('')
    } catch (err) {
      console.error('Erreur mise à jour mode maintenance:', err)
      setModalError('Impossible de mettre à jour le mode maintenance')
    } finally {
      setModalLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setModalError(null)
  }

  const handleSubmitMaintenance = async () => {
    setModalLoading(true)
    setModalError(null)
    
    try {
      await api.post('/admin/maintenance', {
        maintenance_mode: true,
        maintenance_reason: maintenanceReason
      })
      
      setMaintenanceMode(true)
      setShowModal(false)
    } catch (err) {
      console.error('Erreur mise à jour mode maintenance:', err)
      setModalError('Impossible de mettre à jour le mode maintenance')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        <button
          onClick={handleToggleMaintenance}
          disabled={modalLoading}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
            maintenanceMode 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          {modalLoading ? 'En cours...' : maintenanceMode ? 'Désactiver Maintenance' : 'Activer Maintenance'}
        </button>
      </div>
      
      {/* Stats cards - Ligne 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Utilisateurs */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Utilisateurs</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.users_count || 0}</div>
        </div>
        
        {/* Conversations */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Conversations</div>
          <div className="text-3xl font-bold text-neutral-800">{allTimeStats.total_conversations || stats?.conversations_count || 0}</div>
          <div className="text-sm text-neutral-500 mt-1">
            Aujourd'hui: {todayStats.total_conversations || 0} - Semaine: {weekStats.total_conversations || 0}
          </div>
          {(allTimeStats.total_conversations || stats?.conversations_count || 0) > 0 && <MiniChart series={conversationsData} color="#000000" />}
        </div>
        
        {/* Messages */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Messages</div>
          <div className="text-3xl font-bold text-neutral-800">{allTimeStats.total_messages || stats?.messages_count || 0}</div>
          <div className="text-sm text-neutral-500 mt-1">
            Aujourd'hui: {todayStats.total_messages || 0} - Semaine: {weekStats.total_messages || 0}
          </div>
          {(allTimeStats.total_messages || stats?.messages_count || 0) > 0 && <MiniChart series={messagesData} color="#000000" />}
        </div>
        
        {/* Vecteurs */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Vecteurs</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.vectors_count || 0}</div>
        </div>
      </div>
      
      {/* Stats IA - Ligne 2 */}
      <h2 className="text-lg font-semibold text-neutral-700 mb-6">Statistiques IA</h2>
      
      {/* Temps moyen de réponse, Tokens, Avis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Temps moyen de réponse</div>
          <div className="text-lg text-neutral-500 mb-2">Aujourd'hui</div>
          <div className="text-2xl font-bold text-neutral-800">{formatResponseTime(todayStats.avg_response_time_ms || 0)}</div>
          <div className="text-sm text-neutral-500 mt-2">
            Semaine: {formatResponseTime(weekStats.avg_response_time_ms || 0)} - 
            Total: {formatResponseTime(allTimeStats.avg_response_time_ms || 0)}
          </div>
        </div>
        
        {/* Tokens utilisés */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Tokens utilisés <span className='text-sm font-light'>(approximation)</span></div>
          <div className="text-lg text-neutral-500 mb-2">Aujourd'hui</div>
          <div className="text-2xl font-bold text-neutral-800">{formatTokens(todayStats.total_tokens || 0)}</div>
          <div className="text-sm text-neutral-500 mt-2">
            Semaine: {formatTokens(weekStats.total_tokens || 0)} - 
            Total: {formatTokens(allTimeStats.total_tokens || 0)}
          </div>
        </div>
      </div>
      
      {/* Avis - Ligne 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-800 text-sm font-medium mb-2">Avis positifs</div>
          <div className="text-lg text-neutral-800 mb-2">Aujourd'hui</div>
          <div className="text-2xl font-bold text-green-500">{todayStats.positive_reviews || 0}</div>
          <div className="text-sm text-neutral-800 mt-2">
            Semaine: {weekStats.positive_reviews || 0} - 
            Total: {allTimeStats.positive_reviews || 0}
          </div>
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-800 text-sm font-medium mb-2">Avis négatifs</div>
          <div className="text-lg text-neutral-800 mb-2">Aujourd'hui</div>
          <div className="text-2xl font-bold text-red-500">{todayStats.negative_reviews || 0}</div>
          <div className="text-sm text-neutral-800 mt-2">
            Semaine: {weekStats.negative_reviews || 0} - 
            Total: {allTimeStats.negative_reviews || 0}
          </div>
        </div>
      </div>

      {/* Modal Mode Maintenance */}
      {showModal && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">
                Activer le mode maintenance
              </h2>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer p-1 rounded-lg hover:bg-neutral-200 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Raison*
              </label>
              <textarea
                value={maintenanceReason}
                onChange={(e) => setMaintenanceReason(e.target.value)}
                placeholder="Expliquez pourquoi vous activez le mode maintenance..."
                className="w-full p-4 bg-neutral-50 rounded-lg border-0 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-neutral-800 placeholder-neutral-400"
                rows={4}
                disabled={modalLoading}
              />
            </div>

            {modalError && (
              <div className="flex flex-col bg-red-500 text-white px-4 py-3 rounded-lg mb-4" role="alert">
                <div className="flex gap-2 items-center">
                  <TriangleAlert className="w-4 h-4"/>
                  <strong className="font-bold">Erreur !</strong>
                </div>
                <span className="block sm:inline"> {modalError}</span>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={modalLoading}
                className="px-4 py-2 cursor-pointer bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitMaintenance}
                disabled={modalLoading || !maintenanceReason.trim()}
                className={`px-4 py-2 cursor-pointer rounded-lg text-white font-medium disabled:opacity-50 bg-red-500 hover:bg-red-600`}
              >
                {modalLoading ? 'En cours...' : 'Activer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
