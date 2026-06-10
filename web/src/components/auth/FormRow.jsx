'use client'

/**
 * Composant pour une ligne de formulaire contenant plusieurs inputs
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Inputs à afficher côte à côte
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {string} [props.gap='gap-4'] - Espacement entre les éléments
 * @returns {JSX.Element}
 */
export default function FormRow({ children, className = '', gap = 'gap-4' }) {
  return (
    <div className={`flex flex-col sm:flex-row ${gap} ${className}`}>
      {children}
    </div>
  )
}
