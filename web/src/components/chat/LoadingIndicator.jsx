'use client'

import { DotMatrixLoader } from "../shared/DotMatrixLoader"

/**
 * Composant atomique pour afficher un indicateur de chargement animé
 * 
 * @param {Object} props
 * @param {string} [props.className='']  Classes CSS supplémentaires
 * @returns {JSX.Element}
 */
export default function LoadingIndicator({ className = '' }) {
  return (
    <div className="mt-4">
      <DotMatrixLoader
        mixedDots={[{"type":"animated","delay":0,"color":"#ff6900"},{"type":"animated","delay":80,"color":"#ff8904"},{"type":"animated","delay":160,"color":"#ffb86a"}]}
        animation="bounce"
        speed={0.75}
        rows={1}
        cols={3}
        shape="square"
        size={1.5}
        gap={3}
      />
    </div>
  )
}
