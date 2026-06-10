'use client'

import { useState } from 'react'
import NavigationSelector from '@/components/chat/NavigationSelector'
import UserProfile from '@/components/chat/UserProfile'
import SidebarCollapsed from '@/components/chat/SidebarCollapsed'
import AdminNavigation from '@/components/admin/AdminNavigation'
import { PanelLeftClose } from 'lucide-react'

/**
 * Sidebar pour l'espace administration
 * 
 * @param {Object} props
 * @param {Object} props.userInfo - Informations de l'utilisateur
 * @param {boolean} props.isMobile - Indique si l'affichage est mobile
 * @param {boolean} props.isCollapsed - Indique si la sidebar est réduite
 * @param {function} props.onToggle - Callback pour basculer l'affichage
 * @param {function} props.onClose - Callback pour fermer la sidebar sur mobile
 * @returns {JSX.Element}
 */
export default function AdminSidebar({ userInfo, isMobile, isCollapsed, onToggle, onClose }) {

  // Dans l'admin, on affiche toujours "Administration" dans le NavigationSelector
  const currentPage = 'Administration'
  const isOverlayOpen = isMobile && !isCollapsed

  return (
    <>
      {/* Sidebar principale avec animation - toujours fixed sur mobile */}
      <aside className={`bg-neutral-100 h-full overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-12' : 'w-64'} ${isMobile ? 'fixed left-0 top-0 z-50' : ''}`}>
        {isCollapsed ? (
          <SidebarCollapsed 
            currentPage={currentPage} 
            userInfo={userInfo}
            onToggle={onToggle}
          />
        ) : (
          <div className="p-4 h-full flex flex-col">
            {/* Header avec bouton de fermeture pour mobile */}
            {isMobile && (
              <button 
                onClick={onClose}
                className="flex shrink-0 cursor-pointer items-center justify-center w-full px-2 pr-3 py-2 rounded-lg hover:bg-neutral-300 transition-colors text-neutral-800 mb-4"
                aria-label="Close sidebar"
              >
                <PanelLeftClose className='stroke-1'/>
              </button>
            )}
            
            {/* Sélecteur de navigation */}
            <div className="shrink-0">
              <NavigationSelector 
                currentPage={currentPage}
                role={userInfo.role}
              />
            </div>
            
            {/* Navigation Admin (remplace les conversations) */}
            <div className="shrink-0 flex-1">
              <AdminNavigation />
            </div>
            
            {/* Profil utilisateur */}
            <div className="shrink-0">
              <UserProfile userInfo={userInfo} />
            </div>
          </div>
        )}
      </aside>
      
      {/* Overlay pour mobile */}
      {isMobile && isOverlayOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-xs z-40 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        />
      )}
    </>
  )
}
