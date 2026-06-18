'use client'

import { DotMatrixLoader } from "../shared/DotMatrixLoader"

/**
 * Composant atomique pour afficher un indicateur de chargement animé
 * 
 * @param {Object} props
 * @param {string} [props.className='']  Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function LoadingIndicator2({ className = '' }) {
  return (
    <DotMatrixLoader
      mixedDots={[{"type":"animated","delay":320,"color":"currentColor"},{"type":"animated","delay":240,"color":"currentColor"},{"type":"animated","delay":160,"color":"currentColor"},{"type":"animated","delay":80,"color":"currentColor"},{"type":"animated","delay":0,"color":"currentColor"},{"type":"animated","delay":400,"color":"currentColor"},{"type":"animated","delay":320,"color":"currentColor"},{"type":"animated","delay":240,"color":"currentColor"},{"type":"animated","delay":160,"color":"currentColor"},{"type":"animated","delay":80,"color":"currentColor"},{"type":"animated","delay":480,"color":"currentColor"},{"type":"animated","delay":400,"color":"currentColor"},{"type":"animated","delay":320,"color":"currentColor"},{"type":"animated","delay":240,"color":"currentColor"},{"type":"animated","delay":160,"color":"currentColor"},{"type":"animated","delay":560,"color":"currentColor"},{"type":"animated","delay":480,"color":"currentColor"},{"type":"animated","delay":400,"color":"currentColor"},{"type":"animated","delay":320,"color":"currentColor"},{"type":"animated","delay":240,"color":"currentColor"},{"type":"animated","delay":640,"color":"currentColor"},{"type":"animated","delay":560,"color":"currentColor"},{"type":"animated","delay":480,"color":"currentColor"},{"type":"animated","delay":400,"color":"currentColor"},{"type":"animated","delay":320,"color":"currentColor"}]}
      animation="pulse"
      shape="square"
      size={1.5}
      gap={2}
    />
  )
}
