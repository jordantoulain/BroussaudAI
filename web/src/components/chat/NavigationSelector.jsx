'use client'

import { useRouter } from 'next/navigation'
import Dropdown from '@/components/ui/Dropdown'
import { ExternalLink } from 'lucide-react'
import { getPageColor } from '@/utils/pageColors'

/**
 * Composant pour la navigation (Broussaud AI, Boutique Maison Broussaud, Administration)
 * 
 * @param {Object} props
 * @param {string} props.currentPage - Page actuellement sélectionnée
 * @param {string} [props.role] - Rôle de l'utilisateur (USER, ADMIN)
 * @returns {JSX.Element}
 */
export default function NavigationSelector({ currentPage, role }) {
  const router = useRouter()
  const isAdmin = role === 'ADMIN'
  
  // Icône selon la page
  const getIcon = (page) => {
    return (
      <div className={`select-none w-8 h-8 flex items-center justify-center ${getPageColor(page)} rounded-sm`}>
        <span className='font-medium text-white text-xl w-full h-full text-center'>B</span>
      </div>
    )
  }
  
  const items = [
    { label: "Broussaud AI", page: "Broussaud AI" },
    { label: "Vitrine Broussaud", url: "https://www.broussaud.com//", isExternal: true },
    { label: "Boutique Maison Broussaud", url: "https://maisonbroussaud.fr/", isExternal: true }
  ]
  
  if (isAdmin) {
    items.push({ label: "Administration", page: "Administration" })
  }
  
  // Contenu du bouton
  const buttonContent = (
    <div className="flex items-center gap-3">
      {getIcon(currentPage)}
      <span className="text-sm font-medium">{currentPage}</span>
    </div>
  )
  
  return (
    <div className="mb-6">
      <Dropdown
        buttonContent={buttonContent}
        buttonClassName="cursor-pointer items-center justify-between w-full px-2 pr-3 py-2 rounded-lg hover:bg-neutral-300 active:scale-99 transition-all ease-in-out text-neutral-800"
        menuClassName="top-full left-0 right-0 mt-1"
      >
        {items.map((item) => {
          const isExternal = item.isExternal
          const label = item.label
          const page = item.page
          const url = item.url
          
          if (isExternal) {
            return (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded-md gap-3 w-full cursor-pointer px-2 py-2 hover:bg-neutral-100 transition-colors text-neutral-700 text-left text-sm"
              >
                <div className={`select-none w-8 h-8 flex items-center justify-center ${getPageColor(label)} rounded-sm`}>
                  <span className='font-medium text-white text-xl w-full h-full text-center'>B</span>
                </div>
                <span className="flex-1">{label}</span>
                <ExternalLink className="w-4 h-4 mr-1 text-neutral-500" />
              </a>
            )
          }
          
          return (
            <button
              key={label}
              onClick={() => {
                if (page === "Administration") {
                  router.push('/admin')
                } else if (page === "Broussaud AI") {
                  router.push('/chat')
                }
              }}
              className="flex items-center rounded-md gap-3 w-full cursor-pointer px-2 py-2 hover:bg-neutral-100 transition-colors text-neutral-700 text-left text-sm"
            >
              {getIcon(label)}
              <span>{label}</span>
            </button>
          )
        })}
      </Dropdown>
    </div>
  )
}
