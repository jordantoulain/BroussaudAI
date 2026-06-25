'use client'

import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { TriangleAlert } from 'lucide-react'

export default function MaintenancePage() {
  const [maintenanceData, setMaintenanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        // On essaie de récupérer les données via la route publique
        const publicResponse = await api.get('/config/maintenance')
        if (publicResponse.data) {
          setMaintenanceData({
            maintenance_mode: publicResponse.data.maintenance_mode,
            maintenance_reason: publicResponse.data.maintenance_reason || 'Maintenance en cours'
          })
        } else {
          setMaintenanceData({
            maintenance_mode: true,
            maintenance_reason: 'Maintenance en cours'
          })
        }
      } catch (err) {
        // Erreur réseau ou autre, on affiche un message par défaut
        setMaintenanceData({
          maintenance_mode: true,
          maintenance_reason: 'Maintenance en cours'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl p-8">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <TriangleAlert className="w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            Maintenance
          </h1>
          
          <p className="text-neutral-600 mb-6">
            {maintenanceData?.maintenance_reason || 'Le site est actuellement en maintenance. Veuillez revenir plus tard.'}
          </p>
          
          <div className="text-sm text-neutral-500">
            Nous travaillons pour améliorer votre expérience.
          </div>
        </div>
      </div>
    </div>
  )
}
