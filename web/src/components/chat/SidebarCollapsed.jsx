'use client'

import { PanelLeftOpen } from "lucide-react"
import { getPageColor } from '@/utils/pageColors'
import { getRoleColor } from '@/utils/userUtils'
import { AvatarSkeleton } from '@/components/shared'

/**
 * Contenu de la sidebar en mode collapsed (12px de large)
 * 
 * @param {Object} props
 * @param {string} props.currentPage - Page actuellement sélectionnée
 * @param {Object} props.userInfo - Informations de l'utilisateur
 * @param {function} props.onToggle - Callback pour basculer l'affichage
 * @param {boolean} [props.isLoading=false] - État de chargement
 * @returns {JSX.Element}
 */
export default function SidebarCollapsed({ currentPage, userInfo, onToggle, isLoading = false }) {
  const initials = (userInfo?.prenom?.charAt(0) + userInfo?.nom?.charAt(0))?.toUpperCase() || 'U'

  return (
    <div className="flex flex-col items-center py-4 h-full w-12">
      {/* Mode (non cliquable) */}
      <div className={`shrink-0 select-none w-8 h-8 flex items-center justify-center ${getPageColor(currentPage)} rounded-sm`}>
        <span className='font-medium text-white text-lg'>B</span>
      </div>

      {/* Hamburger menu */}
      <button 
        onClick={onToggle} 
        className="shrink-0 cursor-pointer w-8 h-8 flex items-center justify-center bg-neutral-200 rounded-sm hover:bg-neutral-300 transition-colors my-4 group"
        aria-label="Toggle sidebar"
      >
        <span className="transition-transform duration-300 ease-in-out">
          <PanelLeftOpen className="stroke-1 h-5 w-5"/>
        </span>
      </button>

      {/* User initials - tout en bas */}
      {isLoading ? (
        <AvatarSkeleton className="rounded-sm mt-auto" />
      ) : (
        <div className={`shrink-0 select-none w-8 h-8 flex items-center justify-center ${getRoleColor(userInfo?.role)} rounded-sm mt-auto`}>
          <span className='font-medium text-white text-md'>{initials}</span>
        </div>
      )}
    </div>
  )
}
