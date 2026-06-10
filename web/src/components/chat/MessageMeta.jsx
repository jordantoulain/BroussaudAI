'use client'

/**
 * Composant atomique pour afficher les métadonnées d'un message (label, sous-label)
 * 
 * @param {Object} props
 * @param {string} [props.label] - Label principal du message
 * @param {string} [props.subLabel] - Sous-label du message
 * @returns {JSX.Element|null} Retourne null si aucun label n'est présent
 */
export default function MessageMeta({ label, subLabel }) {
  if (!label && !subLabel) return null
  
  return (
    <div className="flex items-center gap-2 text-xs font-normal text-neutral-500 uppercase tracking-wider">
      <span className="font-bold">Broussaud AI</span>
      {/* Barres de couleur orange */}
      <div className="rounded-xs flex w-min overflow-hidden">
        <div className="w-1.5 h-4 bg-orange-500"/>
        <div className="w-1.5 h-4 bg-orange-400"/>
        <div className="w-1.5 h-4 bg-orange-300"/>
      </div>
      <div className="md:flex hidden gap-1.5">
        {label && <span>{label}</span>}
        {label && subLabel && <span>▪</span>}
        {subLabel && <span>{subLabel}</span>}
      </div>
    </div>
  )
}
