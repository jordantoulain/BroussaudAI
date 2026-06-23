'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, MonitorSmartphone, ChevronDown } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import SessionsList from '@/components/chat/SessionsList'
import { AvatarSkeleton, TextSkeleton } from '@/components/shared'
import { getRoleColor } from '@/utils/userUtils'

/**
 * Composant pour afficher le profil utilisateur avec dropdown de deconnexion
 * 
 * @param {Object} props
 * @param {Object} props.userInfo - Informations de l'utilisateur
 * @param {string} props.userInfo.nom - Nom de famille
 * @param {string} props.userInfo.prenom - Prénom
 * @param {string} props.userInfo.mail - Email
 * @param {boolean} [props.isLoading=false] - État de chargement
 * @returns {JSX.Element}
 */
export default function UserProfile({ userInfo, isLoading = false }) {
  // État pour le dropdown et le SideCanvas des sessions
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const dropdownRef = useRef(null)

  // Génération des initiales pour l'avatar
  const initials = userInfo ? (userInfo.prenom.charAt(0) + userInfo.nom.charAt(0)).toUpperCase() : 'U'

  // Fermer le dropdown quand on clique en dehors
  useClickOutside(dropdownRef, () => setShowDropdown(false))

  if (isLoading) {
    return (
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between w-full px-2 pr-3 py-1.5">
          <div className="flex items-center gap-3">
            <AvatarSkeleton className="rounded-md" />
            <div className="flex flex-col gap-1">
              <TextSkeleton widthClass="w-32" />
              <TextSkeleton widthClass="w-40" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const buttonContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className={`select-none w-8 h-8 flex items-center justify-center ${getRoleColor(userInfo?.role)} rounded-md`}>
          <span className='font-medium text-white text-md'>{initials}</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium">{userInfo.prenom} {userInfo.nom}</span>
          <span className="text-xs text-neutral-600">{userInfo.mail}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-auto pt-4">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-between w-full cursor-pointer px-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-300 active:scale-99 transition-all ease-in-out text-neutral-800"
          type="button"
        >
          {buttonContent}
          <ChevronDown className={`w-4 h-4 text-neutral-600 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showDropdown && (
          <div className="absolute flex flex-col gap-2 bottom-full left-0 right-0 mb-1 bg-white rounded-lg z-50 overflow-hidden p-2 shadow-lg">
            <button
              onClick={() => {
                setShowSessions(true)
                setShowDropdown(false)
              }}
              className="cursor-pointer flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-neutral-100 transition-colors text-neutral-700 text-left text-sm"
            >
              <MonitorSmartphone className="w-4 h-4 ml-2" />
              <span>Appareils connectés</span>
            </button>
            
            <Link
              href="/logout"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-neutral-100 transition-colors text-neutral-700 text-left text-sm"
            >
              <LogOut className="w-4 h-4 ml-2" />
              <span>Déconnexion</span>
            </Link>
          </div>
        )}
      </div>
      
      <SessionsList 
        isOpen={showSessions} 
        onClose={() => setShowSessions(false)} 
      />
    </div>
  )
}
