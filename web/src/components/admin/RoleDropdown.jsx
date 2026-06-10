'use client'

import { useState, useRef } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

/**
 * Composant Dropdown custom pour la sélection des rôles
 * 
 * @param {Object} props
 * @param {string} props.value - Valeur sélectionnée
 * @param {Function} props.onChange - Callback lors du changement
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function RoleDropdown({ value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  
  // Fermeture du dropdown quand on clique en dehors
  useClickOutside(dropdownRef, () => setIsOpen(false))
  
  const roles = [
    { value: 'USER', label: 'Utilisateur' },
    { value: 'ADMIN', label: 'Administrateur' }
  ]
  
  const selectedRole = roles.find(r => r.value === value) || roles[0]
  
  const handleSelect = (roleValue) => {
    onChange(roleValue)
    setIsOpen(false)
  }
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-neutral-50 outline-none text-neutral-800 transition-colors"
      >
        <span>{selectedRole.label}</span>
        <ChevronDown 
          className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-100 rounded-xl z-50 overflow-hidden p-2 flex flex-col gap-1">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleSelect(role.value)}
              type="button"
              className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors hover:bg-white hover:text-black ${
                value === role.value ? 'bg-green-400 text-white font-medium' : 'text-neutral-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                value === role.value ? 'border-green-600 bg-green-600 group-hover:bg-neutral-700 group-hover:border-neutral-700' : 'border-neutral-300'
              }`}>
                {value === role.value && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>{role.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
