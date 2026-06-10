'use client'

import { useEffect } from 'react'

/**
 * Hook générique pour détecter les clics en dehors d'un élément
 * @param {import('react').RefObject<HTMLElement>} ref - Référence vers l'élément à surveiller
 * @param {() => void} callback - Fonction à appeler lorsque l'on clique en dehors
 */
export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, callback])
}
