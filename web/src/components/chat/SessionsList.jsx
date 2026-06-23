'use client'

import { useState, useEffect } from 'react'
import { LogOut, Loader2, Smartphone, Monitor, Clock, Calendar, AlertCircle } from 'lucide-react'
import SideCanvas from '@/components/ui/SideCanvas'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/shared'
import { api } from '@/services/api'

/**
 * Skeleton pour une session dans la liste
 * @returns {JSX.Element}
 */
function SessionSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg" aria-hidden="true">
      {/* Infos appareil - skeleton */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          <Skeleton className="w-5 h-5 rounded" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-2 w-1/2 rounded" />
        </div>
      </div>

      {/* Dates et actions - skeleton */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3 w-24">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-6 w-12 rounded" />
      </div>
    </div>
  )
}

/**
 * Formate une date pour l'affichage
 * @param {string} dateString - Date au format ISO
 * @returns {string} Date formatee
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formate la duree jusqu'a l'expiration
 * @param {string} expiresAt - Date d'expiration au format ISO
 * @returns {string} Duree formatee
 */
function formatExpiration(expiresAt = null) {
  if (!expiresAt) return 'Jamais'
  
  const expiresDate = new Date(expiresAt)
  const now = new Date()
  const diffMs = expiresDate - now
  
  if (diffMs <= 0) {
    return 'Expire'
  }
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffDays > 0) {
    return `Expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `Expire dans ${diffHours}h`
  } else if (diffMinutes > 0) {
    return `Expire dans ${diffMinutes} min`
  }
  
  return 'Expire bientot'
}

/**
 * Retourne l'icone appropriee pour le type d'appareil
 * @param {string} deviceInfo - Informations sur l'appareil
 * @returns {JSX.Element} Icone
 */
function getDeviceIcon(deviceInfo) {
  if (!deviceInfo) {
    return <Monitor className="w-5 h-5 text-neutral-500" />
  }
  
  const lowerInfo = deviceInfo.toLowerCase()
  if (lowerInfo.includes('mobile') || lowerInfo.includes('android') || lowerInfo.includes('iphone')) {
    return <Smartphone className="w-5 h-5 text-neutral-500" />
  }
  
  return <Monitor className="w-5 h-5 text-neutral-500" />
}

/**
 * Retourne le nom de l'appareil depuis les informations device_info
 * @param {string} deviceInfo - Informations sur l'appareil
 * @returns {string} Nom de l'appareil
 */
function getDeviceName(deviceInfo, index) {
  if (!deviceInfo || deviceInfo.trim() === '') {
    return `Appareil ${index + 1}`
  }
  
  // Extraire le navigateur
  let browser = 'Inconnu'
  if (deviceInfo.includes('Chrome')) browser = 'Chrome'
  else if (deviceInfo.includes('Firefox')) browser = 'Firefox'
  else if (deviceInfo.includes('Safari')) browser = 'Safari'
  else if (deviceInfo.includes('Edge')) browser = 'Edge'
  else if (deviceInfo.includes('Opera')) browser = 'Opera'
  
  // Extraire le systeme d'exploitation
  let os = 'Inconnu'
  if (deviceInfo.includes('Windows')) os = 'Windows'
  else if (deviceInfo.includes('Mac')) os = 'Mac'
  else if (deviceInfo.includes('Linux')) os = 'Linux'
  else if (deviceInfo.includes('Android')) os = 'Android'
  else if (deviceInfo.includes('iPhone') || deviceInfo.includes('iOS')) os = 'iOS'
  
  // Extraire le type d'appareil
  let device = 'Ordinateur'
  if (deviceInfo.includes('Mobile') || deviceInfo.includes('iPhone') || deviceInfo.includes('Android')) {
    device = 'Mobile'
  }
  
  return `${browser} sur ${os} (${device})`
}

/**
 * Composant pour afficher la liste des sessions/appareils connectes
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Etat d'ouverture du canvas
 * @param {() => void} props.onClose - Fonction pour fermer le canvas
 * @returns {JSX.Element}
 */
export default function SessionsList({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)

  /**
   * Recupere les sessions de l'utilisateur
   */
  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/sessions/')
      setSessions(response.data || [])
    } catch (err) {
      console.error('Erreur lors de la recuperation des sessions:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Impossible de recuperer les sessions'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Ouvre la modale de confirmation pour la deconnexion
   * @param {string} sessionId - ID de la session a supprimer
   */
  const handleOpenConfirmModal = (sessionId) => {
    setSessionToDelete(sessionId)
    setShowConfirmModal(true)
  }

  /**
   * Force la deconnexion d'une session
   */
  const handleLogoutSession = async () => {
    if (!sessionToDelete) return
    
    setDeletingId(sessionToDelete)
    setShowConfirmModal(false)
    
    try {
      await api.delete(`/sessions/${sessionToDelete}`)
      // Rafraichir la liste des sessions
      await fetchSessions()
    } catch (err) {
      console.error('Erreur lors de la deconnexion forcee:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Impossible de deconnecter cet appareil'
      setError(errorMsg)
    } finally {
      setDeletingId(null)
      setSessionToDelete(null)
    }
  }

  // Charger les sessions lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen])

  return (
    <SideCanvas 
      isOpen={isOpen} 
      onClose={onClose}
      title="Appareils connectés"
    >
      <div className="space-y-4">
        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            <span className="text-sm text-white">{error}</span>
          </div>
        )}

        {/* Chargement - affiche 3 skeletons de session */}
        {loading ? (
          <div className="space-y-3">
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </div>
        ) : null}

        {/* Liste vide */}
        {!loading && sessions.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <p className="text-sm">Aucun appareil connecté trouvé.</p>
          </div>
        )}

        {/* Liste des sessions */}
        {!loading && sessions.length > 0 && (
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div 
                key={session.id || index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
              >
                {/* Infos appareil */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getDeviceIcon(session.device_info)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-neutral-800 truncate">
                      {getDeviceName(session.device_info, index)}
                    </div>
                    <div className="text-xs text-neutral-500 truncate">
                      {session.device_info ? session.device_info.substring(0, 50) : 'Non specifie'}
                    </div>
                  </div>
                </div>

                {/* Dates et actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                  {/* Date de creation */}
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(session.created_at)}</span>
                  </div>

                  {/* Date d'expiration */}
                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatExpiration(session.expires_at)}</span>
                  </div>

                  {/* Bouton de deconnexion */}
                  <button
                    onClick={() => handleOpenConfirmModal(session.id)}
                    disabled={deletingId === session.id}
                    className="flex items-center cursor-pointer gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                  >
                    {deletingId === session.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deconnexion...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Forcer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informations */}
        {!loading && (
          <div className="pt-4">
            <p className="text-xs text-neutral-500">
              <strong>Appareil actuel :</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
            </p>
          </div>
        )}
      </div>
      
      {/* Modale de confirmation de deconnexion */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setSessionToDelete(null)
        }}
        onConfirm={handleLogoutSession}
        title="Forcer la déconnexion"
        message="Etes-vous sur de vouloir déconnecter cet appareil ?"
        confirmText="Déconnecter"
        cancelText="Annuler"
        variant="danger"
      />
    </SideCanvas>
  )
}
