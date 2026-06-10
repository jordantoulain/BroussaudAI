'use client'

import { useRouter } from 'next/navigation'
import { Archive } from 'lucide-react'

/**
 * Bouton pour accéder aux archives
 * 
 * @returns {JSX.Element}
 */
export default function ArchiveButton() {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.push('/chat/archives')}
      className="flex cursor-pointer items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-neutral-900 w-full text-left"
    >
      <Archive className="w-4 h-4" />
      <span className="text-sm">Mes archives</span>
    </button>
  )
}
