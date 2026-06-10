'use client'

/**
 * Composant de bouton pour les formulaires d'authentification
 * 
 * @param {Object} props
 * @param {string} [props.type='submit'] - Type du bouton
 * @param {React.ReactNode} props.children - Contenu du bouton
 * @param {string} [props.variant='primary'] - Variante du bouton (primary, secondary, danger)
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 * @param {Object} [props.rest] - Autres props à passer au bouton
 * @returns {JSX.Element}
 */
export default function FormButton({ 
  type = 'submit', 
  children, 
  variant = 'primary',
  className = '',
  ...rest 
}) {
  // Styles selon la variante
  const baseStyles = 'w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-md'
  
  const variants = {
    primary: 'text-white bg-neutral-700 hover:bg-neutral-800',
    secondary: 'text-black bg-transparent hover:bg-neutral-200',
    danger: 'text-white bg-red-500 hover:bg-red-400',
  }
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
