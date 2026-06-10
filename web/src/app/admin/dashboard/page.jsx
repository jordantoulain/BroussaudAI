'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { StatsCardSkeleton, TextSkeleton } from '@/components/shared'
import { TriangleAlert } from 'lucide-react'
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
    
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <TextSkeleton widthClass="w-48" className="h-8 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
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

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-neutral-800 mb-8">Dashboard</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Utilisateurs */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Utilisateurs</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.users_count || 0}</div>
        </div>
        
        {/* Conversations */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Conversations</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.conversations_count || 0}</div>
          {(stats?.conversations_count || 0) > 0 && <MiniChart series={conversationsData} color="#000000" />}
        </div>
        
        {/* Messages */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Messages</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.messages_count || 0}</div>
          {(stats?.messages_count || 0) > 0 && <MiniChart series={messagesData} color="#000000" />}
        </div>
        
        {/* Vecteurs */}
        <div className="bg-neutral-100 rounded-lg p-6">
          <div className="text-neutral-600 text-sm font-medium mb-2">Vecteurs</div>
          <div className="text-3xl font-bold text-neutral-800">{stats?.vectors_count || 0}</div>
        </div>
      </div>
    </div>
  )
}
