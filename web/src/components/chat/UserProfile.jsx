'use client'

import Link from 'next/link'
import { LogOut } from 'lucide-react'
import Dropdown from '@/components/ui/Dropdown'
import { AvatarSkeleton, TextSkeleton } from '@/components/shared'
import { getRoleColor } from '@/utils/userUtils'

/**
 * Composant pour afficher le profil utilisateur avec dropdown de déconnexion
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
  // Génération des initiales pour l'avatar
  const initials = userInfo ? (userInfo.prenom.charAt(0) + userInfo.nom.charAt(0)).toUpperCase() : 'U'
  
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
        {/* Avatar */}
        <div className={`select-none w-8 h-8 flex items-center justify-center ${getRoleColor(userInfo?.role)} rounded-md`}>
          <span className='font-medium text-white text-md'>{initials}</span>
        </div>
        {/* Infos utilisateur */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium">{userInfo.prenom} {userInfo.nom}</span>
          <span className="text-xs text-neutral-600">{userInfo.mail}</span>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="mt-auto pt-4">
      <Dropdown buttonContent={buttonContent} openUpwards buttonClassName="flex items-center justify-between cursor-pointer w-full px-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-300 active:scale-99 transition-all ease-in-out text-neutral-800">
        <Link
          href="/logout"
          className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-neutral-100 transition-colors text-neutral-700 text-left text-sm"
        >
          <LogOut className="w-4 h-4 ml-2" />
          <span>Déconnexion</span>
        </Link>
      </Dropdown>
    </div>
  )
}
