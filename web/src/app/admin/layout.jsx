'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ChatHeader from '@/components/chat/ChatHeader'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useRouter } from 'next/navigation'
import LoadingIndicator2 from '@/components/chat/LoadingIndicator2'

/**
 * Layout pour les pages d'administration
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu des pages admin
 * @returns {JSX.Element}
 */
export default function AdminLayout({ children }) {
  const router = useRouter()
  const { userInfo, loading } = useUserInfo()
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsSidebarCollapsed(mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Redirection si pas ADMIN
  useEffect(() => {
    if (!loading && userInfo.role !== 'ADMIN') {
      router.push('/chat')
    }
  }, [userInfo, loading, router])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingIndicator2 />
      </div>
    )
  }

  if (userInfo.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar
        userInfo={userInfo}
        isMobile={isMobile}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onClose={() => setIsSidebarCollapsed(true)}
      />
      
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden px-4 md:px-10 pl-12">
        {/* Header */}
        <ChatHeader />
        
        {/* Admin content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
