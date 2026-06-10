'use client'

/**
 * Composant atomique pour afficher un badge de tag
 * 
 * @param {Object} props
 * @param {string} props.tag - Texte du tag à afficher
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function TagBadge({ tag, className = '' }) {
  return (
    <span 
      className={`bg-neutral-300 text-neutral-800 text-xs px-2.5 py-1 rounded-md font-light ${className}`}
    >
      #{tag}
    </span>
  )
}
