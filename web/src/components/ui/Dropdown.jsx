'use client'

import { useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

/**
 * Composant Dropdown générique réutilisable
 * Gère son propre état interne
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu du dropdown (menu déroulant)
 * @param {React.ReactNode} props.buttonContent - Contenu du bouton
 * @param {string} [props.className=''] - Classes CSS supplémentaires pour le container
 * @param {string} [props.buttonClassName=''] - Classes CSS supplémentaires pour le bouton
 * @param {string} [props.menuClassName=''] - Classes CSS supplémentaires pour le menu
 * @param {boolean} [props.openUpwards=false] - Si vrai, ouvre le dropdown vers le haut
 * @returns {JSX.Element}
 */
export default function Dropdown({
  children,
  buttonContent,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  openUpwards = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  // Fermeture du dropdown quand on clique en dehors
  useClickOutside(dropdownRef, () => setIsOpen(false))
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full ${buttonClassName}`}
        type="button"
      >
        {buttonContent}
        <ChevronDown 
          className={`w-4 h-4 text-neutral-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div 
          className={`absolute ${openUpwards ? 'bottom-full left-0 right-0 mb-1' : 'top-full left-0 right-0 mt-1'} bg-white rounded-lg z-50 overflow-hidden p-2 ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
