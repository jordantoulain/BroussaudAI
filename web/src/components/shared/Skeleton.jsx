'use client'

/**
 * Composant Skeleton pour afficher un placeholder de chargement
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-neutral-300 rounded-md animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton pour un avatar
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function AvatarSkeleton({ className = '' }) {
  return (
    <div
      className={`w-8 h-8 bg-neutral-300 rounded-md animate-pulse ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton pour une ligne de texte
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function TextSkeleton({ className = '', widthClass = 'w-full' }) {
  return (
    <Skeleton className={`rounded-full h-3  ${widthClass} ${className}`} />
  )
}

/**
 * Skeleton pour une carte de statistiques (Dashboard)
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function StatsCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-neutral-100 rounded-lg p-6 ${className}`} aria-hidden="true">
      <TextSkeleton widthClass="w-24" className="mb-2" />
      <TextSkeleton widthClass="w-16" className="text-3xl" />
    </div>
  )
}

/**
 * Skeleton pour une ligne de tableau
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {number} [props.cells=5] - Nombre de cellules
 * @returns {JSX.Element}
 */
export function TableRowSkeleton({ className = '', cells = 5 }) {
  return (
    <tr className={className} aria-hidden="true">
      {Array.from({ length: cells }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <TextSkeleton widthClass={index === 0 ? 'w-32' : index === 1 ? 'w-24' : 'w-40'} />
        </td>
      ))}
    </tr>
  )
}

/**
 * Skeleton pour une carte de conversation
 * 
 * @param {Object} props
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export function ConversationCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-neutral-100 rounded-lg overflow-hidden ${className}`} aria-hidden="true">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <TextSkeleton widthClass="w-3/4" className="mb-2" />
            <div className="space-y-1">
              <TextSkeleton widthClass="w-1/2" />
              <TextSkeleton widthClass="w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
