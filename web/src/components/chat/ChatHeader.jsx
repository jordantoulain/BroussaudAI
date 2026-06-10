'use client'

import { Logo } from '@/components/shared'
import { Archive, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Composant atomique pour le header du chat avec le logo
 * 
 * @param {Object} props
 * @param {string} [props.title] - Titre de la conversation
 * @param {boolean} [props.isArchived=false] - Indique si c'est une conversation archivée
 * @returns {JSX.Element}
 */
export default function ChatHeader({ title, isArchived = false }) {
  const router = useRouter()
  return (
    <header className="px-6 py-4 flex justify-between items-center shrink-0">
      {title ? (
        <>
          <button
            onClick={() => router.push('/chat/archives')}
            className="cursor-pointer flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Retour aux archives</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-neutral-800">{title}</h2>
            <Archive className="w-4 h-4 text-neutral-500" />
          </div>
        </>
      ) : (
        <Logo width={150} height={150} className="mt-5" />
      )}
    </header>
  )
}
